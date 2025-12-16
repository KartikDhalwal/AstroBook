import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import api from "../apiConfig";

const { width } = Dimensions.get("window");

// 👇 Your stripHTML function
const stripHTML = (html) => {
  if (!html) return "No data available.";

  return html
    .replace(/<\/h2>/gi, "\n\n")
    .replace(/<\/h3>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<ol>/gi, "")
    .replace(/<\/ol>/gi, "")
    .replace(/<ul>/gi, "")
    .replace(/<\/ul>/gi, "")
    .replace(/<li>/gi, "• ")
    .replace(/<[^>]+>/g, "")         // remove remaining HTML tags
    .replace(/&nbsp;/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n") // reduce extra spacing
    .trim();
};

const BlogDetailsScreen = ({ route }) => {
  const { blog } = route.params;
  const [blogData, setBlogData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBlogDetails = async () => {
    try {
      const response = await axios.post(
        `${api}/customers/blog_detail`,
        { blogId: blog._id },
        { headers: { "Content-Type": "application/json" } }
      );

      setBlogData(response.data?.data);
    } catch (err) {
      console.log("Error fetching blog details:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogDetails();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#db9a4a" />
      </View>
    );
  }

  if (!blogData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={{ color: "#000" }}>Failed to load blog details.</Text>
      </View>
    );
  }

  const cleanDescription = stripHTML(blogData.description);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header Image */}
      <Image
        source={{
          uri: "https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan/uploads/" + blogData.image,
        }}
        style={styles.blogImage}
      />

      {/* Title */}
      <Text style={styles.title}>{blogData.title}</Text>

      {/* Meta Info */}
      <View style={styles.metaRow}>
        <View style={styles.metaItem}>
          <Icon name="tag-outline" size={16} color="#db9a4a" />
          <Text style={styles.metaText}>
            {blogData.blogCategoryId?.blog_category}
          </Text>
        </View>

        <View style={styles.metaItem}>
          <Icon name="account" size={16} color="#db9a4a" />
          <Text style={styles.metaText}>{blogData.created_by}</Text>
        </View>

        <View style={styles.metaItem}>
          <Icon name="calendar" size={16} color="#db9a4a" />
          <Text style={styles.metaText}>
            {new Date(blogData.createdAt).toDateString()}
          </Text>
        </View>
      </View>

      {/* STRIPPED HTML TEXT */}
      <View style={styles.textContainer}>
        <Text style={styles.blogText}>{cleanDescription}</Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
};

export default BlogDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7EE",
    paddingHorizontal: 16,
  },
  blogImage: {
    width: "100%",
    height: 220,
    borderRadius: 12,
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 14,
    color: "#1A1A1A",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 14,
  },
  metaText: {
    marginLeft: 4,
    fontSize: 13,
    color: "#555",
  },
  textContainer: {
    marginTop: 18,
    backgroundColor: "#FFF8ED",
    padding: 14,
    borderRadius: 12,
  },
  blogText: {
    color: "#333",
    fontSize: 15,
    lineHeight: 24,
    whiteSpace: "pre-wrap",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#FDF7EE",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FDF7EE",
  },
});
