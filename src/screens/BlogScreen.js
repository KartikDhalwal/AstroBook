import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
} from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import axios from "axios";
import api from "../apiConfig";

const BlogScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(12);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchBlogs = async () => {
    if (!hasMore || loading) return;

    setLoading(true);

    try {
      const response = await axios.get(
        `${api}/customers/all_blogs?page=${page}&limit=${limit}`,
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(response.data,'response.dataresponse.data')
      const newBlogs = response.data?.results || [];

      if (newBlogs.length === 0) {
        setHasMore(false);
      } else {
        setBlogs((prev) => [...prev, ...newBlogs]);
      }
    } catch (err) {
      console.log("Error fetching blogs:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchBlogs();
  }, [page]);

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderBlogItem = ({ item }) => (
    <TouchableOpacity
      style={styles.blogCard}
      activeOpacity={0.8}
      onPress={() => navigation.navigate("Blog", { blog: item })}
    >
      <Image
        source={{
          uri: "https://alb-web-assets.s3.ap-south-1.amazonaws.com/acharyalavbhushan/uploads/" + item.image,
        }}
        style={styles.blogImage}
      />

      <View style={styles.blogContent}>
        <View style={styles.categoryRow}>
          <Icon name="tag-outline" size={16} color="#db9a4a" />
          <Text style={styles.categoryText}>
            {item.blogCategoryId?.blog_category}
          </Text>
        </View>

        <Text style={styles.blogTitle} numberOfLines={2}>
          {item.title}
        </Text>

        <Text style={styles.blogAuthor}>By {item.created_by}</Text>

        <Text style={styles.blogDate}>
          {new Date(item.createdAt).toDateString()}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      <FlatList
        data={blogs}
        keyExtractor={(item) => item._id}
        renderItem={renderBlogItem}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#db9a4a"
              style={{ marginVertical: 20 }}
            />
          ) : null
        }
      />
    </View>
  );
};

export default BlogScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FDF7EE",
    paddingHorizontal: 16,
    marginTop:14
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: "700",
    marginTop: 10,
    color: "#1A1A1A",
  },
  pageSubtitle: {
    fontSize: 13,
    color: "#6A6A6A",
    marginBottom: 16,
  },
  blogCard: {
    backgroundColor: "#ffffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    elevation: 2,
  },
  blogImage: {
    width: "100%",
    height: 160,
  },
  blogContent: {
    padding: 12,
  },
  categoryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  categoryText: {
    marginLeft: 6,
    fontSize: 12,
    color: "#db9a4a",
    fontWeight: "600",
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 6,
  },
  blogAuthor: {
    fontSize: 12,
    color: "#555",
    marginBottom: 2,
  },
  blogDate: {
    fontSize: 12,
    color: "#777",
  },
});
