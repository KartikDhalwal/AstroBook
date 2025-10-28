import { PixelRatio } from 'react-native';

// Base URLs
export const base_url = 'https://api.astroboosters.com/';
export const api_url = 'https://astrokunj.com/api/';
export const img_url = 'https://api.astroboosters.com/uploads/';
export const provider_img_url = 'https://astrokunj.com/admin/';
export const img_url_astrologer = 'https://astrokunj.com/admin/uploads/vendor/';
export const img_url_2 = 'https://astrokunj.com/admin/uploads/vendor/';
export const img_url_page = 'https://astrokunj.com/admin/uploads/page/';

// ------------------ Customer APIs ------------------
export const API = {
  user: {
    login: 'user_web_api/login?',
    verificationOtp: 'user_web_api/verification_otp?',
    signupGoogle: 'user_web_api/signup_google',
    uploadPic: 'user_web_api/upload_customer_pic',
    chatIn: 'user/chat_in.php',
    getBanner: 'user/get_banner.php',
    getNotifications: 'api/getNotifications',
    updateNotifications: 'api/updateNotifications',
    liveSchedule: 'api/user_live_schedule'
  },
  api2: {
    getCountries: 'api2/get_countries',
    getState: 'api2/get_state',
    getProfile: 'api2/get_profile',
    logout: 'api2/logout',
    tarotCards: 'api2/tarot_cards',
    customerDateProfile: 'api2/customer_date_profile',
    isCustomerRegister: 'api2/is_customer_register',
    allUsers: 'api2/all_users',
    myPlans: 'api2/myplans',
    astroDatePlans: 'api2/astrodate_plans',
    subscriptionsPurchase: 'api2/subscriptions_purchase',
    createKundali: 'api2/create_kundali',
    myKundali: 'api2/my_kundali',
    getChart: 'api2/get_chart',
    getChartWeb: 'api2/get_chart_webpg',
    matchMaking: 'api2/match_making',
    getHoroscope: 'api2/get_horoscope',
    getCity: 'api2/get_city',
    getTarotCardDetail: 'api2/get_tarot_card_detail',
    blog: 'api2/blog',
    boostProfile: 'api2/boost_profile',
    allRequest: 'api2/all_request',
    likedMe: 'api2/liked_me',
    liked: 'api2/liked',
    recommendedFriends: 'api2/recommended_friends',
    customerDateImagesUpload: 'api2/customer_date_images_upload',
    getCustomerDateImages: 'api2/get_customer_date_images',
    updateRequest: 'api2/update_request',
    setDND: 'api2/set_dnd',
    getUserDetails: 'api2/get_user_details',
    sendGift: 'api2/send_gift',
    sendFriendRequest: 'api2/send_friend_request',
    deleteKundali: 'api2/delete_kundali',
    editKundali: 'api2/edit_kundali',
    getKundali: 'api2/get_kundali',
    createPhonePeOrder: 'api2/create_phonepe_order',
    createPhonePeOrderTest: 'api2/create_phonepe_order_test',
    phonePeReactNative: 'api2/phonepe_react_native',
    getChartAll: 'api2/get_chart_all',
    phonePeSuccess: 'api2/phonepe_success',
    majorVdasha: 'api2/get_major_vdasha',
    getSubVdasha: 'api2/get_sub_vdasha',
    getSubSubVdasha: 'api2/get_sub_sub_vdasha',
    getSubSubSubVdasha: 'api2/get_sub_sub_sub_vdasha',
    getSubSubSubSubVdasha: 'api2/get_sub_sub_sub_sub_vdasha',
    getPdf: 'api2/get_pdf',
    getHouseReport: 'api2/get_HouseReport',
    getRashiReport: 'api2/get_RashiReport',
    updateBlog: 'api2/update_blog',
    getKpHoroscope: 'api2/get_KpHoroscope',
    getModal: 'api2/getModal',
    getAstrologerOffer: 'api2/get_astrologer_offer',
    createBlog: 'api2/create_blog',
    getBlogs: 'api2/get_blogs',
    deleteBlog: 'api2/delete_blog',
    toggleBlog: 'api2/toggle_blog',
    getBlogsUser: 'api2/get_blogs_user',
    getAstroDetails: 'api2/get_astro_details'
  },
  api: {
    astrolist1: 'api/astrolist1',
    astroDetails: 'api/astrodetails',
    callIntakeSubmit: 'api/callintakesubmit',
    callIntake: 'api/callintake',
    getAstroChatStatus: 'api/getastrochatstatus',
    getRechargePlans: 'api/getRechargeplans',
    addWallet: 'api/addwallet',
    addReview: 'api/addreview',
    acceptChat: 'api/accept_chat',
    matchData: 'customers/match_making',
    deductWallet: 'api/deductwallet',
    orderHistory: 'api/order_history',
    getFollowingList: 'api/getfollowinglist',
    follow: 'api/follow',
    checkFollowing: 'api/checkfollowing',
    astroCallToAstrologer: 'api_astro/call_to_astrologer',
    getLiveList: 'api/getdata',
    howToUseVideos: 'api/howtousevideos',
    whatICanAsk: 'api/whaticanask',
    getLanguage: 'api/get_language',
    getSkill: 'api/get_skill',
    getExpertise: 'api/get_experties',
    markAsReadMessage: 'api/mark_as_read_message',
    updateAstroChat: 'api/update_astro_chat',
    getRashiReport: 'api/get_rashi_report',
    getGifts: 'api/getGifts',
    sendGifts: 'api/sendgift',
    deductWalletHistory: 'api/deductwallet_history',
    liveExitReview: 'api/liveExitReview',
    updateFlash: 'api/updateFlash',
    appYear: 'api/app_year'
  },
  kundli: {
    getKundli: 'kundli/get_kundli',
    getPanchang: 'kundli/get_panchang',
    getPlanets: 'kundli/get_planets'
  }
};

// ------------------ Astrologer APIs ------------------
export const ASTRO = {
  login: 'user/astrologer_login.php',
  dashboard: 'api/astrologer_dashboard',
  changeStatusCall: 'api/changestatuscall',
  changeStatus: 'api/changestatus',
  followingList: 'api/getfollowinglistastro',
  orderHistory: 'api/astroOrder_history',
  updateIntakeStatus: 'api/update_intake_status',
  createLive: 'api/create_live_astrologer',
  liveList: 'api/get_astrologer_live_details',
  liveHistory: 'api/astro_live_history',
  updateLiveStatus: 'api/update_live_status',
  deleteLive: 'api/live_delete',
  goLive: 'api/golive',
  exitLive: 'api/exitlive',
  checkLive: 'api/check_live',
  markAsRead: 'api/mark_as_read',
  getReligion: 'api/get_religion',
  getDailyPanchang: 'api/get_dailypanchang',
  getMagazine: 'api/get_magazine',
  getBirhatHoroscope: 'api/get_birhat_horoscope',
  getRemedies: 'api/get_remedies',
  getRemediesApp: 'api/get_remedies_app',
  getYellow: 'api/get_yellow',
  getAuspicious: 'api/get_auspicions',
  getQuestion: 'api/get_question',
  getBanner: 'api/getBanner'
};

// ------------------ App Config ------------------
export const google_map_key = 'AIzaSyDNDyUOHXpIPvqWPabSSN518pXpwsDemSc';
export const call_app_id = 1999906308;
export const call_app_sign = 'd4d7c9f488ad6e4e0e76baf0e6796b191fd650729107cc90f9bde5472240eb0c';
export const live_app_id = 2037570915;
export const live_app_sign = 'db72c30909904099cc1c17532a8fd4b74324cfb10664cbe1b214c8462e3a0137';
export const live_streaming_app_id = 989424788;
export const live_streaming_app_sign = '43ba6854ca9e61a0cc718a494589f0a6e76ed6e4befcaea663fcbfe845a646b4';
export const video_call_id = '1804652732';
export const Video_app_sign = 'cda5ae04ef3cd585a9cca284f6082c5f863172663ea961b23a7a39258f7b7aa7';

// ------------------ Astrology API ------------------
export const ASTRO_API = {
  endpoint: 'horo_chart_image',
  generalAscendantReport: 'general_ascendant_report',
  horoscope: 'kp_horoscope',
  basicPanchang: 'basic_panchang',
  kpBirthChart: 'kp_birth_chart',
  birthHoroChart: 'horo_chart/D1',
  sunSignPrediction: 'sun_sign_prediction',
  planets: 'planets',
  userId: '630051',
  apiKey: '861bba6a92587a326a9b11ab9dfb9b7ca3492fab',
  liveSecret: 'd6f16228fe579f02e68ffecba70c2696'
};

// ------------------ colors ------------------
export const colors = {
  black: '#000',
  black1: '#f8f9fa',
  black2: '#e9ecef',
  black3: '#dee2e6',
  black4: '#ced4da',
  black5: '#adb5bd',
  black6: '#6c757d',
  black7: '#495057',
  black8: '#343a40',
  black9: '#212529',
  white: '#fff',
  grey: '#adb5bd',
  green1: '#6a994e',
  green2: '#29bf12',
  yellow1: '#ffbc42',
  yellow2: '#ffdab9',
  yellow3: '#f4a261',
  yellow4: '#fffae5',
  magenta1: '#7209b7',
  magenta2: '#c77dff',
  pink1: '#9e0059',
  pink2: '#fae0e4',
  pink3: '#ffa6c1',
  red1: '#ff5a5f',
  background1: '#fff',
  background2: '#f8bd01',
  background3: '#bdd3ff',
  background4: '#F2805F',
  headerBackground: '#DCDCDC70',
  bookStatusBar: '#DCDCDC70',
  astrobook1: '#f8bd01',
  myBackground: '#fff0d4',
  background_theme2: '#f8bd01'
};

// ------------------ Fonts ------------------
export const Fonts = {
  bold: 'OpenSans-Bold',
  semiBold: 'OpenSans-SemiBold',
  medium: 'OpenSans-Medium',
  light: 'OpenSans-Light',
  black11InterMedium: { fontSize: 11, fontFamily: 'Inter-Medium', color: colors.black },
  white14RobotoRegular: { fontSize: 14, fontFamily: 'Roboto-Regular', color: colors.white },
  primary16Bold: { fontSize: 16, fontFamily: 'OpenSans-Bold', color: colors.black }
};

// ------------------ Images ------------------
export const VedicImages = {
  flag: require('../assets/images/india-flag.jpeg'),
  chatBackground: require('../assets/images/chat_background.jpeg')
};

// ------------------ Utils ------------------
export const getFontSize = (size) => {
  return PixelRatio.getFontScale() * size;
};
