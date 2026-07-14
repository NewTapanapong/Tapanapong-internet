import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Product = {
  id: string;
  name: string;
  brand: string;
  price: string;
  image: string;
};

const COLORS = { 
  primary: "#db10db", 
  primaryDark: "#db10db", 
  background: "#db9696", 
  surface: "#F8FAFC", 
  border: "#E2E8F0", 
  text: "#0F172A", 
  textSecondary: "#64748B", 
}; 

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true); // เพิ่มสถานะ Loading

  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/NewTapanapong/Tapanapong-internet/refs/heads/main/src/app/products.json";

  const fetchProducts = () => {
    setIsLoading(true);
    fetch(GITHUB_JSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Error fetching products:", error);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []); 

  return ( 
    <SafeAreaView style={styles.container}> 
      <StatusBar 
        barStyle="dark-content" 
        backgroundColor={COLORS.background} 
      /> 

      {/* Header */} 
      <View style={styles.header}> 
        <TouchableOpacity style={styles.iconButton}> 
          <Ionicons name="menu" size={24} color={COLORS.text} /> 
        </TouchableOpacity> 

        <Text style={styles.headerTitle}>Products</Text> 

        <TouchableOpacity style={styles.profileButton}> 
          <Ionicons name="person" size={18} color="#fff" /> 
        </TouchableOpacity> 
      </View> 

      {/* Search */} 
      <View style={styles.searchRow}> 
        <View style={styles.searchBox}> 
          <Ionicons 
            name="search" 
            size={18} 
            color={COLORS.textSecondary} 
          /> 

          <TextInput 
            placeholder="Search products..." 
            placeholderTextColor={COLORS.textSecondary} 
            style={styles.input} 
          /> 
        </View> 

        <TouchableOpacity style={styles.addButton}> 
          <Text style={styles.addButtonText}>+ Add Product</Text> 
        </TouchableOpacity> 
      </View> 

      {/* Filter */} 
      <View style={styles.filterRow}> 
        <TouchableOpacity style={styles.filterButton}> 
          <Text style={styles.filterText}>Filter ▼</Text> 
        </TouchableOpacity> 
      </View> 

      {/* Product Area */}  
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
        ) : (
          <FlatList
            data={products}
            keyExtractor={(item) => item.id.toString()} // ป้องกัน Error กรณี id เป็น number
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Image source={{ uri: item.image }} style={styles.image} />
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.brand}>{item.brand}</Text>
                <Text style={styles.price}>{item.price}</Text>
              </View>
            )}
          />
        )}
      </View>

      {/* Bottom Navigation */} 
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem}> 
          <Ionicons 
            name="home" 
            size={24} 
            color={COLORS.textSecondary} 
          /> 
          <Text style={styles.navText}>Home</Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem}> 
          <Ionicons 
            name="add-circle" 
            size={30} 
            color={COLORS.primary} 
          /> 
          <Text 
            style={[ 
              styles.navText, 
              { color: COLORS.primary, fontWeight: "600" }, 
            ]} 
          > 
            Add 
          </Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem}> 
          <MaterialIcons 
            name="inventory-2" 
            size={24} 
            color={COLORS.primary} 
          /> 
          <Text 
            style={[ 
              styles.navText, 
              { color: COLORS.primary, fontWeight: "600" }, 
            ]} 
          > 
            Products 
          </Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem}> 
          <Ionicons 
            name="folder" 
            size={24} 
            color={COLORS.textSecondary} 
          /> 
          <Text style={styles.navText}>Categories</Text> 
        </TouchableOpacity> 
      </View> 
    </SafeAreaView> 
  ); 
} 

const styles = StyleSheet.create({ 
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background, 
  }, 

  header: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    paddingHorizontal: 20, 
    paddingVertical: 18, 
    backgroundColor: COLORS.background, 
    borderBottomWidth: 1, 
    borderBottomColor: COLORS.border, 
  }, 

  headerTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: COLORS.primary, 
  }, 

  iconButton: { 
    width: 36, 
    alignItems: "center", 
  }, 

  profileButton: { 
    width: 38, 
    height: 38, 
    borderRadius: 19, 
    backgroundColor: COLORS.primary, 
    justifyContent: "center", 
    alignItems: "center", 
  }, 

  searchRow: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 18, 
    paddingTop: 18, 
  }, 

  searchBox: { 
    flex: 1, 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: COLORS.surface, 
    borderRadius: 12, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
    paddingHorizontal: 12, 
    height: 48, 
  }, 

  input: { 
    flex: 1, 
    marginLeft: 8, 
    color: COLORS.text, 
  }, 

  addButton: { 
    marginLeft: 12, 
    backgroundColor: COLORS.primary, 
    paddingHorizontal: 18, 
    height: 48, 
    borderRadius: 12, 
    justifyContent: "center", 
    elevation: 2, 
  }, 

  addButtonText: { 
    color: "#fff", 
    fontWeight: "700", 
  }, 

  filterRow: { 
    paddingHorizontal: 18, 
    paddingTop: 15, 
  }, 

  filterButton: { 
    alignSelf: "flex-end", 
  }, 

  filterText: { 
    color: COLORS.primary, 
    fontWeight: "600", 
    fontSize: 15, 
  }, 

  listContainer: {
    flex: 1, // บังคับให้พื้นที่ส่วนแสดงผลสินค้ากินพื้นที่ที่เหลือทั้งหมด
  },

  card: { 
    backgroundColor: "#fff", 
    borderRadius: 16, 
    padding: 14, 
    marginHorizontal: 16, 
    marginVertical: 8, 
    borderWidth: 1, 
    borderColor: COLORS.border, 
  }, 

  image: { 
    width: "100%", 
    height: 180, 
    resizeMode: "contain", 
  }, 

  name: { 
    marginTop: 10, 
    fontSize: 18, 
    fontWeight: "700", 
    color: COLORS.text, 
  }, 

  brand: { 
    color: COLORS.textSecondary, 
    marginTop: 4, 
  }, 

  price: { 
    marginTop: 8, 
    fontSize: 18, 
    fontWeight: "700", 
    color: COLORS.primary, 
  }, 

  bottomNav: { 
    flexDirection: "row", 
    backgroundColor: COLORS.background, 
    borderTopWidth: 1, 
    borderTopColor: COLORS.border, 
    paddingVertical: 12, 
  }, 

  navItem: { 
    flex: 1, 
    alignItems: "center", 
  }, 

  navText: { 
    marginTop: 4, 
    fontSize: 12, 
    color: COLORS.textSecondary, 
  }, 
});