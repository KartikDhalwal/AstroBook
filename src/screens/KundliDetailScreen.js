import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    LayoutAnimation,
    Platform,
    UIManager,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";

// Enable LayoutAnimation on Android
if (Platform.OS === "android") {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

// ===========================================
// 1. CONFIGURATION
// ===========================================

const tabs = [
    { id: "general", title: "General Info", icon: "star-four-points" },
    { id: "charts", title: "Charts & Graphs", icon: "chart-arc" },
    { id: "planet", title: "Planetary Data", icon: "solar-system" },
    { id: "dosha", title: "Doshas & Effects", icon: "alert-decagram" },
    { id: "dasha", title: "Dashas", icon: "zodiac-aquarius" },
    { id: "kp", title: "KP Astrology", icon: "telescope" },
    { id: "other", title: "Other Systems", icon: "book-open" },
];

// ===========================================
// 2. GENERIC HELPERS (for mixed API formats)
// ===========================================

/**
 * Normalizes common AstroTalk-style responses:
 * - Format A: { success, responseData:{ data:[...] } }
 * - Format B: { success, data:{...} }
 * - Format C: plain object/array
 * Optional innerKey: extracts from array items (e.g. astrodata)
 */
const normalizeApiResponse = (root, { innerKey } = {}) => {
    if (!root) return null;

    let payload;

    if (root.responseData?.data != null) {
        payload = root.responseData.data;
    } else if (root.responseData != null) {
        payload = root.responseData;
    } else if (root.data != null) {
        payload = root.data;
    } else {
        payload = root;
    }

    if (Array.isArray(payload)) {
        if (innerKey) {
            const mapped = payload.map((item) =>
                item && typeof item === "object" && item[innerKey]
                    ? item[innerKey]
                    : item
            );
            return mapped.length === 1 ? mapped[0] : mapped;
        }
        return payload.length === 1 ? payload[0] : payload;
    }

    return payload;
};

// ===========================================
// 3. REUSABLE UI COMPONENTS
// ===========================================

const CollapsibleCard = ({ title, children, defaultOpen = false }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    const toggle = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsOpen((prev) => !prev);
    };

    return (
        <View style={collapsibleStyles.card}>
            <TouchableOpacity onPress={toggle} style={collapsibleStyles.header}>
                <Text style={collapsibleStyles.title}>{title}</Text>
                <Icon
                    name={isOpen ? "chevron-up" : "chevron-down"}
                    size={24}
                    color="#4A2F1D"
                />
            </TouchableOpacity>
            {isOpen && <View style={collapsibleStyles.content}>{children}</View>}
        </View>
    );
};

// Generic data renderer with formatting
const DataSection = ({ title, data }) => {
    if (!data) {
        return (
            <CollapsibleCard title={title}>
                <Text style={dataSectionStyles.noData}>No data available</Text>
            </CollapsibleCard>
        );
    }

    // Array of objects -> table-style
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object") {
        return (
            <CollapsibleCard title={title}>
                {data.map((row, rowIndex) => (
                    <View key={rowIndex} style={dataSectionStyles.tableRow}>
                        {Object.entries(row).map(([key, value]) => (
                            <View key={key} style={dataSectionStyles.tableCell}>
                                <Text style={dataSectionStyles.cellKey}>
                                    {key.replace(/_/g, " ").toUpperCase()}
                                </Text>
                                <Text style={dataSectionStyles.cellVal}>
                                    {typeof value === "object"
                                        ? JSON.stringify(value)
                                        : String(value)}
                                </Text>
                            </View>
                        ))}
                    </View>
                ))}
            </CollapsibleCard>
        );
    }

    // Plain object -> key/value
    if (typeof data === "object") {
        return (
            <CollapsibleCard title={title}>
                {Object.entries(data).map(([key, value]) => (
                    <View key={key} style={dataSectionStyles.row}>
                        <Text style={dataSectionStyles.keyText}>
                            {key.replace(/_/g, " ").toUpperCase()}
                        </Text>
                        <Text style={dataSectionStyles.valueText}>
                            {typeof value === "object"
                                ? JSON.stringify(value)
                                : String(value)}
                        </Text>
                    </View>
                ))}
            </CollapsibleCard>
        );
    }

    // Primitive
    return (
        <CollapsibleCard title={title}>
            <Text style={dataSectionStyles.valueText}>{String(data)}</Text>
        </CollapsibleCard>
    );
};

// Planet table with horizontal scroll
const PlanetTable = ({ title, rows }) => {
    if (!rows || !Array.isArray(rows) || rows.length === 0) return null;

    const firstRow = rows[0];
    if (!firstRow || typeof firstRow !== "object") {
        return <DataSection title={title} data={rows} />;
    }

    const headers = Object.keys(firstRow);

    return (
        <CollapsibleCard title={title}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View>
                    <View style={planetStyles.headerRow}>
                        {headers.map((h) => (
                            <Text key={h} style={planetStyles.headerText}>
                                {h.replace(/_/g, " ").toUpperCase()}
                            </Text>
                        ))}
                    </View>

                    {rows.map((row, i) => (
                        <View key={i} style={planetStyles.row}>
                            {headers.map((h) => (
                                <Text key={h} style={planetStyles.cell}>
                                    {typeof row[h] === "object"
                                        ? JSON.stringify(row[h])
                                        : String(row[h])}
                                </Text>
                            ))}
                        </View>
                    ))}
                </View>
            </ScrollView>
        </CollapsibleCard>
    );
};

// Dosha card
const DoshaCard = ({ title, data }) => {
    if (!data) return null;

    const d = data.data || data;

    return (
        <CollapsibleCard title={title}>
            <View style={doshaStyles.block}>
                {d.status || d.dosha_status ? (
                    <Text style={doshaStyles.status}>
                        Status: {d.status || d.dosha_status}
                    </Text>
                ) : null}

                {d.description ? (
                    <Text style={doshaStyles.desc}>{d.description}</Text>
                ) : null}

                {Array.isArray(d.remedies) && d.remedies.length > 0 && (
                    <>
                        <Text style={doshaStyles.remTitle}>Remedies:</Text>
                        {d.remedies.map((item, idx) => (
                            <Text key={idx} style={doshaStyles.remItem}>
                                • {item}
                            </Text>
                        ))}
                    </>
                )}
            </View>
        </CollapsibleCard>
    );
};

// Dasha table
const DashaTable = ({ title, data }) => {
    if (!data) return null;

    const raw = data.data || data;
    const list = Array.isArray(raw) ? raw : [];

    if (!list.length) {
        return <DataSection title={title} data={data} />;
    }

    return (
        <CollapsibleCard title={title}>
            {list.map((row, i) => (
                <View key={i} style={dashaStyles.row}>
                    <Text style={dashaStyles.planetText}>
                        {row.planet || row.dasha || row.name}
                    </Text>
                    <Text style={dashaStyles.dateText}>
                        {row.start_date || row.startDate || row.from}
                    </Text>
                    <Text style={dashaStyles.dateText}>
                        {row.end_date || row.endDate || row.to}
                    </Text>
                </View>
            ))}
        </CollapsibleCard>
    );
};

// KP generic table
const KPTable = ({ title, data }) => {
    if (!data) return null;

    const d = data.data || data;

    return (
        <CollapsibleCard title={title}>
            {Array.isArray(d) ? (
                d.map((item, idx) => (
                    <View key={idx} style={kpStyles.row}>
                        <Text style={kpStyles.key}>
                            {String(item.name || item.planet || idx + 1)}
                        </Text>
                        <Text style={kpStyles.val}>{JSON.stringify(item)}</Text>
                    </View>
                ))
            ) : typeof d === "object" ? (
                Object.entries(d).map(([k, v]) => (
                    <View key={k} style={kpStyles.row}>
                        <Text style={kpStyles.key}>
                            {k.replace(/_/g, " ").toUpperCase()}
                        </Text>
                        <Text style={kpStyles.val}>
                            {typeof v === "object" ? JSON.stringify(v) : String(v)}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={kpStyles.val}>{String(d)}</Text>
            )}
        </CollapsibleCard>
    );
};

// ---------- Chart helpers ----------

// Normalize any chart payload into 12 houses
const normalizeChartData = (raw) => {
    if (!raw) return [];
    const payload = raw.data || raw;
    let arr = [];

    if (Array.isArray(payload)) {
        arr = payload;
    } else if (Array.isArray(payload?.houses)) {
        arr = payload.houses;
    } else if (typeof payload === "object") {
        arr = Object.values(payload).filter((v) => typeof v === "object");
    }

    const houses = arr.map((h, idx) => {
        const houseNo = h.house || h.house_no || h.bhava || h.bhava_no || idx + 1;
        const sign =
            h.sign ||
            h.rashi ||
            h.rashi_name ||
            h.sign_name ||
            h.zodiac ||
            h.zodiac_name;
        let planets =
            h.planets ||
            h.planet ||
            h.graha ||
            h.planet_name ||
            h.graha_name ||
            [];

        if (typeof planets === "string") {
            planets = planets.split(",").map((p) => p.trim());
        }
        if (!Array.isArray(planets)) planets = [String(planets)];

        return {
            house: houseNo,
            sign,
            planets,
        };
    });

    const final = [];
    for (let i = 0; i < 12; i++) {
        final[i] = houses[i] || { house: i + 1, sign: "", planets: [] };
    }

    return final;
};

// 3x4 grid chart
const ChartGrid = ({ houses }) => {
    if (!houses || houses.length === 0) return null;
    const cells = houses.slice(0, 12);

    const rows = [cells.slice(0, 4), cells.slice(4, 8), cells.slice(8, 12)];

    return (
        <View style={chartStyles.grid}>
            {rows.map((row, rIdx) => (
                <View key={rIdx} style={chartStyles.gridRow}>
                    {row.map((cell, cIdx) => (
                        <View key={cIdx} style={chartStyles.gridCell}>
                            <Text style={chartStyles.houseNo}>H{cell.house}</Text>
                            {cell.sign ? (
                                <Text style={chartStyles.signText}>{cell.sign}</Text>
                            ) : null}
                            {cell.planets && cell.planets.length > 0 ? (
                                <Text style={chartStyles.planetText} numberOfLines={3}>
                                    {cell.planets.join(", ")}
                                </Text>
                            ) : null}
                        </View>
                    ))}
                </View>
            ))}
        </View>
    );
};

const ChartSection = ({ title, data }) => {
    const houses = normalizeChartData(data);
    if (!houses.length) return null;

    const label = title.replace(/_/g, " ").toUpperCase();

    return (
        <CollapsibleCard title={`${label} CHART`}>
            <ChartGrid houses={houses} />
        </CollapsibleCard>
    );
};

const TabButton = ({ tab, activeTab, onPress }) => (
    <TouchableOpacity
        style={[tabStyles.tab, activeTab === tab.id && tabStyles.activeTab]}
        onPress={() => onPress(tab.id)}
    >
        <Icon
            name={tab.icon}
            size={20}
            color={activeTab === tab.id ? "#FFF" : "#4A2F1D"}
            style={tabStyles.tabIcon}
        />
        <Text
            style={[
                tabStyles.tabText,
                activeTab === tab.id && tabStyles.activeTabText,
            ]}
        >
            {tab.title}
        </Text>
    </TouchableOpacity>
);

// ===========================================
// 4. MAIN COMPONENT
// ===========================================

const KundliDetailScreen = ({ route }) => {
    const { kundliId } = route.params;

    const [initialLoading, setInitialLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("general");

    const [dataLoading, setDataLoading] = useState(
        tabs.reduce((acc, tab) => ({ ...acc, [tab.id]: false }), {})
    );

    const [basic, setBasic] = useState(null);
    const [astroData, setAstroData] = useState(null);
    const [birthData, setBirthData] = useState(null);
    const [friendship, setFriendship] = useState(null);
    const [charts, setCharts] = useState(null);
    const [planetData, setPlanetData] = useState(null);
    const [dosha, setDosha] = useState(null);
    const [dasha, setDasha] = useState(null);
    const [kp, setKP] = useState(null);
    const [numerology, setNumerology] = useState(null); // { core, gemini }
    const [prediction, setPrediction] = useState(null);

    const reqBodyRef = useRef(null);

    // ---------- Basic + general tab ----------
    const fetchBasicDetails = async () => {
        try {
            const res = await axios.post(
                "https://api.acharyalavbhushan.com/api/kundli/get_kundli_basic_details",
                { kundliId },
                { headers: { "Content-Type": "application/json" } }
            );

            const d = res.data?.data;
            const p = res.data?.payload;

            if (!d || !p) {
                setInitialLoading(false);
                setDataLoading((prev) => ({ ...prev, general: false }));
                return;
            }

            const basicData = {
                name: d.name,
                place: d.place,
                gender: d.gender,
                day: p.day,
                month: p.month,
                year: p.year,
                hour: p.hour,
                min: p.min,
                latitude: p.lat,
                longitude: p.lon,
                timezone: p.tzone,
            };
            setBasic(basicData);

            const req = {
                name: d.name,
                day: String(p.day),
                month: String(p.month),
                year: String(p.year),
                hour: String(p.hour),
                min: String(p.min),
                latitude: String(p.lat),
                longitude: String(p.lon),
                timezone: "5.5",
                place: d.place,
                gender: d.gender,
            };
            reqBodyRef.current = req;

            const [astroRes, birthRes, friendRes, numerologyRes, predictionsRes] =
                await Promise.all([
                    axios.post(
                        "https://kundli2.astrosetalk.com/api/astro/get_astro_data",
                        req
                    ),
                    axios.post(
                        "https://kundli2.astrosetalk.com/api/astro/get_birth_data",
                        req
                    ),
                    axios.post(
                        "https://kundli2.astrosetalk.com/api/astro/get_friendship_data",
                        req
                    ),
                    axios.post(
                        "https://kundli2.astrosetalk.com/api/numerlogy/get_details",
                        req
                    ),
                    axios.post(
                        "https://kundli2.astrosetalk.com/api/prediction/get_prediction",
                        req
                    ),
                ]);

            // Astro data (you logged astrodata nested structure)
            const astroNorm = normalizeApiResponse(astroRes.data, {
                innerKey: "astrodata",
            });
            setAstroData(astroNorm);

            // Birth data (guess innerKey 'birthdata' if present)
            const birthNormRaw = normalizeApiResponse(birthRes.data, {
                innerKey: "birthdata",
            });
            setBirthData(birthNormRaw);

            // Friendship data (guess innerKey 'friendshipdata' or fallback)
            const friendNorm = normalizeApiResponse(friendRes.data, {
                innerKey: "friendshipdata",
            });
            setFriendship(friendNorm);

            // Numerology core
            const numerologyCore = normalizeApiResponse(numerologyRes.data);
            setNumerology({ core: numerologyCore });

            // Predictions
            const predictionNorm = normalizeApiResponse(predictionsRes.data);
            setPrediction(predictionNorm);
        } catch (err) {
            console.error("Error fetching basic/general details:", err);
        } finally {
            setInitialLoading(false);
            setDataLoading((prev) => ({ ...prev, general: false }));
        }
    };

    // ---------- Tab-specific loaders ----------
    const fetchTabContent = useCallback(async (tabId) => {
        if (!reqBodyRef.current) return;

        setDataLoading((prev) => ({ ...prev, [tabId]: true }));
        const req = reqBodyRef.current;

        try {
            switch (tabId) {
                case "charts": {
                    const [
                        lagna,
                        navamansha,
                        chalit,
                        moonChart,
                        sunChart,
                        hora,
                        dreshkan,
                        dashmansha,
                        dwadash,
                        trisham,
                        shashtyamsha,
                    ] = await Promise.all([
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_lagna_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_navamansha_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_chalit_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_moon_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_sun_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_hora_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_dreshkan_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_dashamansha_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_dwadashamansha_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_trishamansha_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/chart/get_shashtymsha_chart",
                            req
                        ),
                    ]);

                    setCharts({
                        lagna: normalizeApiResponse(lagna.data),
                        navamansha: normalizeApiResponse(navamansha.data),
                        chalit: normalizeApiResponse(chalit.data),
                        moon: normalizeApiResponse(moonChart.data),
                        sun: normalizeApiResponse(sunChart.data),
                        hora: normalizeApiResponse(hora.data),
                        dreshkan: normalizeApiResponse(dreshkan.data),
                        dashmansha: normalizeApiResponse(dashmansha.data),
                        dwadash: normalizeApiResponse(dwadash.data),
                        trisham: normalizeApiResponse(trisham.data),
                        shashtyamsha: normalizeApiResponse(shashtyamsha.data),
                    });
                    break;
                }

                case "planet": {
                    const [allPlanets, allUpgraha, dashamBhav, ashtak, sarvashtak] =
                        await Promise.all([
                            axios.post(
                                "https://kundli2.astrosetalk.com/api/planet/get_all_planet_data",
                                req
                            ),
                            axios.post(
                                "https://kundli2.astrosetalk.com/api/planet/get_all_upgraha_data",
                                req
                            ),
                            axios.post(
                                "https://kundli2.astrosetalk.com/api/planet/get_dasham_bhav_madhya",
                                req
                            ),
                            axios.post(
                                "https://kundli2.astrosetalk.com/api/planet/get_ashtak_varga_data",
                                req
                            ),
                            axios.post(
                                "https://kundli2.astrosetalk.com/api/planet/get_sarvashtak_data",
                                req
                            ),
                        ]);

                    setPlanetData({
                        allPlanets: normalizeApiResponse(allPlanets.data),
                        upgraha: normalizeApiResponse(allUpgraha.data),
                        dashamBhav: normalizeApiResponse(dashamBhav.data),
                        ashtak: normalizeApiResponse(ashtak.data),
                        sarvashtak: normalizeApiResponse(sarvashtak.data),
                    });
                    break;
                }

                case "dosha": {
                    const [mangal, kalsharp, pitra, sadhesati] = await Promise.all([
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dosha/mangal_dosh_analysis",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dosha/kalsharp_dosh_analysis",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dosha/pitra_dosh_analysis",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dosha/sadhesati_analysis",
                            req
                        ),
                    ]);

                    setDosha({
                        mangal: normalizeApiResponse(mangal.data),
                        kalsharp: normalizeApiResponse(kalsharp.data),
                        pitra: normalizeApiResponse(pitra.data),
                        sadhesati: normalizeApiResponse(sadhesati.data),
                    });
                    break;
                }

                case "dasha": {
                    const [
                        vimDasha,
                        vimCurrent,
                        yogini,
                        yoginiCurrent,
                        charDasha,
                        charCurrent,
                    ] = await Promise.all([
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dasha/get_vimshottary_maha_dasha",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dasha/get_vimshottary_current_dasha",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dasha/get_yogini_maha_dasha",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/dasha/get_yogini_current_dasha",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/gemini/get_char_dasha_data",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/gemini/get_current_char_dasha_data",
                            req
                        ),
                    ]);

                    setDasha({
                        vimshottari: normalizeApiResponse(vimDasha.data),
                        vimCurrent: normalizeApiResponse(vimCurrent.data),
                        yogini: normalizeApiResponse(yogini.data),
                        yoginiCurrent: normalizeApiResponse(yoginiCurrent.data),
                        char: normalizeApiResponse(charDasha.data),
                        charCurrent: normalizeApiResponse(charCurrent.data),
                    });
                    break;
                }

                case "kp": {
                    const [
                        kpBirth,
                        kpCusps,
                        kpBirthChart,
                        kpPlanets,
                        kpCuspsData,
                        kpSignificators,
                        kpRuling,
                        houseSignificators,
                    ] = await Promise.all([
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/kp_birth_data",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_cusps_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_birth_chart",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_all_planet_data",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_cusps_data",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_planet_significators",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_ruling_planets",
                            req
                        ),
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/kp/get_house_significators",
                            req
                        ),
                    ]);

                    setKP({
                        birth: normalizeApiResponse(kpBirth.data),
                        cuspsChart: normalizeApiResponse(kpCusps.data),
                        birthChart: normalizeApiResponse(kpBirthChart.data),
                        planets: normalizeApiResponse(kpPlanets.data),
                        cuspsData: normalizeApiResponse(kpCuspsData.data),
                        significators: normalizeApiResponse(kpSignificators.data),
                        ruling: normalizeApiResponse(kpRuling.data),
                        houseSign: normalizeApiResponse(houseSignificators.data),
                    });
                    break;
                }

                case "other": {
                    const [gemini] = await Promise.all([
                        axios.post(
                            "https://kundli2.astrosetalk.com/api/gemini/get_gemini_data",
                            req
                        ),
                    ]);
                    const geminiData = normalizeApiResponse(gemini.data);
                    setNumerology((prev) => ({
                        ...(prev || {}),
                        gemini: geminiData,
                    }));
                    break;
                }

                default:
                    break;
            }
        } catch (err) {
            console.error(`Error fetching data for tab ${tabId}:`, err);
        } finally {
            setDataLoading((prev) => ({ ...prev, [tabId]: false }));
        }
    }, []);

    // ---------- Initial load ----------
    useEffect(() => {
        setDataLoading((prev) => ({ ...prev, general: true }));
        fetchBasicDetails();
    }, [kundliId]);

    // ---------- Lazy tab loading ----------
    useEffect(() => {
        const isDataLoaded = (tabId) => {
            switch (tabId) {
                case "general":
                    return astroData !== null;
                case "charts":
                    return charts !== null;
                case "planet":
                    return planetData !== null;
                case "dosha":
                    return dosha !== null;
                case "dasha":
                    return dasha !== null;
                case "kp":
                    return kp !== null;
                case "other":
                    return numerology !== null && numerology.gemini !== undefined;
                default:
                    return true;
            }
        };

        if (!initialLoading && !isDataLoaded(activeTab) && !dataLoading[activeTab]) {
            fetchTabContent(activeTab);
        }
    }, [
        activeTab,
        initialLoading,
        fetchTabContent,
        astroData,
        charts,
        planetData,
        dosha,
        dasha,
        kp,
        numerology,
        dataLoading,
    ]);

    const renderTabContent = useMemo(() => {
        if (dataLoading[activeTab]) {
            return (
                <View style={styles.tabLoader}>
                    <ActivityIndicator size="large" color="#7F1D1D" />
                    <Text style={styles.loadingText}>
                        Fetching {tabs.find((t) => t.id === activeTab).title} data...
                    </Text>
                </View>
            );
        }

        switch (activeTab) {
            case "general":
                return (
                    <>
                        <DataSection title="Astro Data" data={astroData} />
                        <DataSection title="Birth Details" data={birthData} />
                        <DataSection title="Planet Friendship" data={friendship} />
                        <DataSection title="Predictions Summary" data={prediction} />
                        <DataSection
                            title="Numerology Overview"
                            data={numerology?.core}
                        />
                    </>
                );

            case "charts":
                if (!charts) return null;
                return (
                    <>
                        {Object.entries(charts).map(([key, data]) => (
                            <ChartSection key={key} title={key} data={data} />
                        ))}
                    </>
                );

            case "planet":
                if (!planetData) return null;
                return (
                    <>
                        <PlanetTable
                            title="Planet Positions"
                            rows={planetData?.allPlanets}
                        />
                        <PlanetTable title="Upgraha" rows={planetData?.upgraha} />
                        <DataSection
                            title="Dasham Bhav Madhya"
                            data={planetData?.dashamBhav}
                        />
                        <DataSection title="Ashtak Varga" data={planetData?.ashtak} />
                        <DataSection title="Sarvashtak" data={planetData?.sarvashtak} />
                    </>
                );

            case "dosha":
                if (!dosha) return null;
                return (
                    <>
                        <DoshaCard title="Mangal Dosh" data={dosha?.mangal} />
                        <DoshaCard title="Kalsharp Dosh" data={dosha?.kalsharp} />
                        <DoshaCard title="Pitra Dosh" data={dosha?.pitra} />
                        <DoshaCard title="Sadhesati Analysis" data={dosha?.sadhesati} />
                    </>
                );

            case "dasha":
                if (!dasha) return null;
                return (
                    <>
                        <DashaTable
                            title="Vimshottari Maha Dasha"
                            data={dasha?.vimshottari}
                        />
                        <DashaTable
                            title="Current Vimshottari Dasha"
                            data={dasha?.vimCurrent}
                        />
                        <DashaTable title="Yogini Maha Dasha" data={dasha?.yogini} />
                        <DashaTable
                            title="Current Yogini Dasha"
                            data={dasha?.yoginiCurrent}
                        />
                        <DashaTable title="Char Dasha" data={dasha?.char} />
                        <DashaTable
                            title="Current Char Dasha"
                            data={dasha?.charCurrent}
                        />
                    </>
                );

            case "kp":
                if (!kp) return null;
                return (
                    <>
                        <KPTable title="KP Birth Data" data={kp?.birth} />
                        <ChartSection title="KP Cusps Chart" data={kp?.cuspsChart} />
                        <ChartSection title="KP Birth Chart" data={kp?.birthChart} />
                        <KPTable title="KP Planets" data={kp?.planets} />
                        <KPTable title="KP Cusps Data" data={kp?.cuspsData} />
                        <KPTable title="KP Significators" data={kp?.significators} />
                        <KPTable title="Ruling Planets" data={kp?.ruling} />
                        <KPTable title="House Significators" data={kp?.houseSign} />
                    </>
                );

            case "other":
                return (
                    <>
                        <DataSection
                            title="Numerology Core Details"
                            data={numerology?.core}
                        />
                        <DataSection title="Predictions Summary" data={prediction} />
                        <DataSection
                            title="Gemini System Data"
                            data={numerology?.gemini}
                        />
                    </>
                );

            default:
                return null;
        }
    }, [
        activeTab,
        dataLoading,
        astroData,
        birthData,
        friendship,
        charts,
        planetData,
        dosha,
        dasha,
        kp,
        numerology,
        prediction,
    ]);

    if (initialLoading) {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="large" color="#7F1D1D" />
                <Text style={styles.loadingText}>
                    Loading Kundli basic profile...
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.fullScreenContainer}>
            {/* Header */}
            <View style={styles.headerCard}>
                <Text style={styles.name}>{basic?.name || "User Kundli"}</Text>
                <Text style={styles.sub}>{basic?.place}</Text>
                <View style={styles.dateRow}>
                    <Icon name="calendar" size={14} color="#555" />
                    <Text style={styles.subDetail}>
                        {basic
                            ? `${basic.day}/${basic.month}/${basic.year}`
                            : "..."}
                    </Text>
                    <Icon
                        name="clock-outline"
                        size={14}
                        color="#555"
                        style={{ marginLeft: 15 }}
                    />
                    <Text style={styles.subDetail}>
                        {basic ? `${basic.hour}:${basic.min}` : "..."}
                    </Text>
                    <Icon
                        name="gender-male-female"
                        size={14}
                        color="#555"
                        style={{ marginLeft: 15 }}
                    />
                    <Text style={styles.subDetail}>
                        {basic?.gender || "..."}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={tabStyles.tabContainer}
                contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
            >

                {tabs.map((tab) => (
                    <TabButton
                        key={tab.id}
                        tab={tab}
                        activeTab={activeTab}
                        onPress={setActiveTab}
                    />
                ))}
            </ScrollView>

            {/* Content */}
            <ScrollView
                style={styles.contentContainer}
                showsVerticalScrollIndicator={false}
            >
                {renderTabContent}
                <View style={{ height: 80 }} />
            </ScrollView>
        </View>
    );
};

export default KundliDetailScreen;

// ===========================================
// 5. STYLES
// ===========================================

const styles = StyleSheet.create({
    fullScreenContainer: {
        flex: 1,
        backgroundColor: "#F8F4EF",
    },
    contentContainer: {
        flex: 1,
        padding: 16,
    },
    loader: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#F8F4EF",
    },
    tabLoader: {
        justifyContent: "center",
        alignItems: "center",
        padding: 40,
        backgroundColor: "#FFF",
        borderRadius: 12,
        marginTop: 10,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: "#7F1D1D",
        fontWeight: "500",
    },
    headerCard: {
        backgroundColor: "#FFF",
        padding: 20,
        paddingBottom: 15,
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
        elevation: 6,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    name: {
        fontSize: 24,
        fontWeight: "800",
        color: "#2C1810",
        marginBottom: 4,
    },
    sub: {
        color: "#777",
        fontSize: 14,
        marginBottom: 10,
    },
    dateRow: {
        flexDirection: "row",
        alignItems: "center",
    },
    subDetail: {
        marginLeft: 4,
        marginRight: 5,
        color: "#555",
        fontSize: 13,
    },
});

const collapsibleStyles = StyleSheet.create({
    card: {
        backgroundColor: "#FFF",
        borderRadius: 12,
        marginBottom: 10,
        overflow: "hidden",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#FEFCE8",
    },
    title: {
        fontSize: 16,
        fontWeight: "700",
        color: "#4A2F1D",
    },
    content: {
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: "#F3EFE9",
    },
});

const dataSectionStyles = StyleSheet.create({
    noData: {
        color: "#B91C1C",
        fontStyle: "italic",
    },
    row: {
        flexDirection: "row",
        marginBottom: 6,
        alignItems: "flex-start",
    },
    keyText: {
        fontWeight: "600",
        color: "#2C1810",
        width: 140,
        marginRight: 8,
        fontSize: 13,
    },
    valueText: {
        flex: 1,
        color: "#555",
        fontSize: 13,
    },
    tableRow: {
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#ECE7DD",
        borderRadius: 8,
        padding: 8,
    },
    tableCell: {
        marginBottom: 4,
    },
    cellKey: {
        fontSize: 11,
        fontWeight: "700",
        color: "#7F1D1D",
    },
    cellVal: {
        fontSize: 13,
        color: "#444",
    },
});

const chartStyles = StyleSheet.create({
    grid: {
        borderWidth: 1,
        borderColor: "#D6CEC2",
        borderRadius: 10,
        overflow: "hidden",
    },
    gridRow: {
        flexDirection: "row",
    },
    gridCell: {
        flex: 1,
        borderRightWidth: 1,
        borderBottomWidth: 1,
        borderColor: "#D6CEC2",
        padding: 6,
        minHeight: 70,
    },
    houseNo: {
        fontSize: 11,
        fontWeight: "700",
        color: "#7F1D1D",
        marginBottom: 2,
    },
    signText: {
        fontSize: 11,
        color: "#444",
        marginBottom: 2,
    },
    planetText: {
        fontSize: 11,
        color: "#222",
    },
});

const tabStyles = StyleSheet.create({
    tabContainer: {
        flexDirection: "row",
        paddingVertical: 6,        // reduced from 10
        backgroundColor: "#F8F4EF",
        // borderBottomWidth: 1,
        borderBottomColor: "#DDD",
        maxHeight:50
    },

    tab: {
        paddingHorizontal: 14,     // reduced horizontal padding
        paddingVertical: 6,        // reduced vertical padding
        marginRight: 10,
        borderRadius: 18,          // smaller pill
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EAE6E1",
        maxHeight: 40,             // ↓ lower height (was 40)
    },

    activeTab: {
        backgroundColor: "#7F1D1D",
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 2,
    },

    tabIcon: {
        marginRight: 4,
        fontSize: 16,              // ↓ slightly smaller icon
    },

    tabText: {
        fontSize: 12,              // ↓ smaller text
        fontWeight: "600",
        color: "#4A2F1D",
    },

    activeTabText: {
        color: "#FFF",
    },
});



const planetStyles = StyleSheet.create({
    headerRow: {
        flexDirection: "row",
        backgroundColor: "#FEF3C7",
        paddingHorizontal: 8,
        paddingVertical: 6,
    },
    headerText: {
        minWidth: 80,
        fontSize: 11,
        fontWeight: "700",
        color: "#7F1D1D",
        marginRight: 8,
    },
    row: {
        flexDirection: "row",
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F3EFE9",
    },
    cell: {
        minWidth: 80,
        fontSize: 11,
        color: "#333",
        marginRight: 8,
    },
});

const doshaStyles = StyleSheet.create({
    block: {
        paddingVertical: 8,
    },
    status: {
        fontWeight: "700",
        fontSize: 14,
        color: "#B91C1C",
        marginBottom: 6,
    },
    desc: {
        fontSize: 13,
        color: "#444",
        marginBottom: 8,
        lineHeight: 18,
    },
    remTitle: {
        fontSize: 13,
        fontWeight: "700",
        color: "#2C1810",
        marginBottom: 4,
    },
    remItem: {
        fontSize: 13,
        color: "#444",
        marginBottom: 2,
    },
});

const dashaStyles = StyleSheet.create({
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F1EDE5",
    },
    planetText: {
        flex: 1,
        fontSize: 13,
        fontWeight: "600",
        color: "#7F1D1D",
    },
    dateText: {
        flex: 1,
        fontSize: 12,
        color: "#555",
        textAlign: "right",
    },
});

const kpStyles = StyleSheet.create({
    row: {
        marginBottom: 6,
        paddingBottom: 6,
        borderBottomWidth: 1,
        borderBottomColor: "#F3EFE9",
    },
    key: {
        fontSize: 12,
        fontWeight: "700",
        color: "#2C1810",
        marginBottom: 2,
    },
    val: {
        fontSize: 12,
        color: "#444",
    },
});
