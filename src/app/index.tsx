import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// 1. กำหนด Type ของข้อมูลให้ตรงกับโครงสร้าง JSON
type Product = {
  id: string;
  name: string;
  brand: string;
  price: string | number;
  image: string;
  category?: string; // เพิ่มฟิลด์หมวดหมู่สำหรับระบบกรอง
};

const COLORS = { 
  primary: "#db10db", 
  primaryDark: "#b50bb5", 
  background: "#db9696", 
  surface: "#F8FAFC", 
  border: "#E2E8F0", 
  text: "#0F172A", 
  textSecondary: "#64748B", 
}; 

const PLACEHOLDER_IMAGE = "https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?q=80&w=500&auto=format&fit=crop";

export default function HomeScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // States สำหรับระบุฟังก์ชันการกดต่าง ๆ
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterModalVisible, setFilterModalVisible] = useState<boolean>(false);
  const [addModalVisible, setAddModalVisible] = useState<boolean>(false);
  const [menuModalVisible, setMenuModalVisible] = useState<boolean>(false);
  const [profileModalVisible, setProfileModalVisible] = useState<boolean>(false);
  const [categoryModalVisible, setCategoryModalVisible] = useState<boolean>(false);

  // States สำหรับฟอร์มเพิ่มสินค้าใหม่
  const [newName, setNewName] = useState("");
  const [newBrand, setNewBrand] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const GITHUB_JSON_URL = "https://raw.githubusercontent.com/NewTapanapong/Tapanapong-internet/refs/heads/main/src/app/products.json";

  const fetchProducts = useCallback(() => {
    setIsLoading(true);
    setErrorMsg(null);

    fetch(GITHUB_JSON_URL)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (Status: ${response.status})`);
        }
        return response.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // เพิ่มหมวดหมู่จำลองเข้าไปในข้อมูลเพื่อใช้ทดสอบปุ่ม Categories
          const mockCategories = ["Electronics", "Fashion", "Gadgets", "Others"];
          const enrichedData = data.map((item, index) => ({
            ...item,
            category: item.category || mockCategories[index % mockCategories.length]
          }));
          setProducts(enrichedData);
          setFilteredProducts(enrichedData);
        } else {
          throw new Error("รูปแบบข้อมูลใน GitHub ไม่ใช่ Array");
        }
        setIsLoading(false);
      })
      .catch((error) => {
        console.log("Fetch Error:", error);
        setErrorMsg("ไม่สามารถโหลดข้อมูลได้ หรือไฟล์บน GitHub มีปัญหา");
        setIsLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // ฟังก์ชันรีเซ็ตค่ากลับหน้าแรก
  const handleResetHome = () => {
    setSearchQuery("");
    setFilteredProducts(products);
    Alert.alert("รีเซ็ตหน้าจอ", "กลับสู่รายการสินค้าทั้งหมดแล้ว");
  };

  // ระบบค้นหา (Search)
  const handleSearch = (text: string) => {
    setSearchQuery(text);
    if (text.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(
        (p) =>
          p.name.toLowerCase().includes(text.toLowerCase()) ||
          p.brand.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  // ระบบกรองราคา (Filter / Sorting)
  const handleSort = (type: "lowToHigh" | "highToLow") => {
    const sorted = [...filteredProducts].sort((a, b) => {
      const priceA = parseFloat(String(a.price).replace(/[^0-9.]/g, "")) || 0;
      const priceB = parseFloat(String(b.price).replace(/[^0-9.]/g, "")) || 0;
      return type === "lowToHigh" ? priceA - priceB : priceB - priceA;
    });
    setFilteredProducts(sorted);
    setFilterModalVisible(false);
  };

  // ระบบกรองตามหมวดหมู่สินค้า (Category Filter)
  const handleSelectCategory = (category: string) => {
    setCategoryModalVisible(false);
    setSearchQuery("");
    if (category === "ALL") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter((p) => p.category === category);
      setFilteredProducts(filtered);
      Alert.alert(`หมวดหมู่: ${category}`, `แสดงสินค้าเฉพาะกลุ่ม ${category}`);
    }
  };

  // ระบบเพิ่มสินค้าจำลอง (Add Product)
  const handleAddProduct = () => {
    if (!newName || !newBrand || !newPrice) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลให้ครบถ้วนทุกช่อง");
      return;
    }

    const newProduct: Product = {
      id: Date.now().toString(),
      name: newName,
      brand: newBrand,
      price: isNaN(Number(newPrice)) ? newPrice : `฿${parseFloat(newPrice).toLocaleString()}`,
      image: PLACEHOLDER_IMAGE,
      category: "Others"
    };

    const updatedList = [newProduct, ...products];
    setProducts(updatedList);
    setFilteredProducts(updatedList);

    setNewName("");
    setNewBrand("");
    setNewPrice("");
    setAddModalVisible(false);
    
    Alert.alert("สำเร็จ", "เพิ่มสินค้าชิ้นใหม่เรียบร้อยแล้ว!");
  };

  const renderItem = useCallback(({ item }: { item: Product }) => {
    return (
      <TouchableOpacity 
        activeOpacity={0.8}
        onPress={() => Alert.alert(item.brand, `${item.name}\nหมวดหมู่: ${item.category}\nราคา: ${item.price}`)}
      >
        <ProductCard item={item} />
      </TouchableOpacity>
    );
  }, []);

  return ( 
    <SafeAreaView style={styles.container}> 
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} /> 

      {/* Header Area */} 
      <View style={styles.header}> 
        <TouchableOpacity style={styles.iconButton} onPress={() => setMenuModalVisible(true)}> 
          <Ionicons name="menu" size={24} color={COLORS.text} /> 
        </TouchableOpacity> 
        <Text style={styles.headerTitle}>Products</Text> 
        <TouchableOpacity style={styles.profileButton} onPress={() => setProfileModalVisible(true)}> 
          <Ionicons name="person" size={18} color="#fff" /> 
        </TouchableOpacity> 
      </View> 

      {/* Search Bar */} 
      <View style={styles.searchRow}> 
        <View style={styles.searchBox}> 
          <Ionicons name="search" size={18} color={COLORS.textSecondary} /> 
          <TextInput 
            placeholder="Search products..." 
            placeholderTextColor={COLORS.textSecondary} 
            style={styles.input} 
            value={searchQuery}
            onChangeText={handleSearch}
          /> 
        </View> 
        <TouchableOpacity style={styles.addButton} onPress={() => setAddModalVisible(true)}> 
          <Text style={styles.addButtonText}>+ Add</Text> 
        </TouchableOpacity> 
      </View> 

      {/* Filter Section */} 
      <View style={styles.filterRow}> 
        <TouchableOpacity style={styles.filterButton} onPress={() => setFilterModalVisible(true)}> 
          <Text style={styles.filterText}>Filter ▼</Text> 
        </TouchableOpacity> 
      </View> 

      {/* Product List Content Area */}  
      <View style={styles.listContainer}>
        {isLoading ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={{ flex: 1 }} />
        ) : errorMsg ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMsg}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchProducts}>
              <Text style={styles.retryButtonText}>ลองใหม่อีกครั้ง</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id.toString()}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
            renderItem={renderItem}
            initialNumToRender={5}
            maxToRenderPerBatch={10}
            windowSize={5}
            ListEmptyComponent={
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>ไม่พบสินค้าที่คุณค้นหา</Text>
              </View>
            }
          />
        )}
      </View>

      {/* UI Navigation Bottom Bar */} 
      <View style={styles.bottomNav}> 
        <TouchableOpacity style={styles.navItem} onPress={handleResetHome}> 
          <Ionicons name="home" size={24} color={COLORS.textSecondary} /> 
          <Text style={styles.navText}>Home</Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem} onPress={() => setAddModalVisible(true)}> 
          <Ionicons name="add-circle" size={30} color={COLORS.primary} /> 
          <Text style={[styles.navText, { color: COLORS.primary, fontWeight: "600" }]}>Add</Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem} onPress={() => { setSearchQuery(""); setFilteredProducts(products); }}> 
          <MaterialIcons name="inventory-2" size={24} color={COLORS.primary} /> 
          <Text style={[styles.navText, { color: COLORS.primary, fontWeight: "600" }]}>Products</Text> 
        </TouchableOpacity> 

        <TouchableOpacity style={styles.navItem} onPress={() => setCategoryModalVisible(true)}> 
          <Ionicons name="folder" size={24} color={COLORS.textSecondary} /> 
          <Text style={styles.navText}>Categories</Text> 
        </TouchableOpacity> 
      </View> 

      {/* ==================== MODAL MENU (ซ้ายบน) ==================== */}
      <Modal visible={menuModalVisible} transparent animationType="slide" onRequestClose={() => setMenuModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setMenuModalVisible(false)}>
          <View style={[styles.modalContent, { alignSelf: 'flex-start', marginLeft: 20, width: '70%' }]}>
            <Text style={styles.modalTitle}>🍔 เมนูหลัก</Text>
            {["หน้าแรก", "แดชบอร์ด", "คลังสินค้า", "รายงานยอดขาย", "ตั้งค่าระบบ"].map((menu, i) => (
              <TouchableOpacity key={i} style={styles.modalOption} onPress={() => { setMenuModalVisible(false); Alert.alert(menu, `กำลังเปิดหน้า ${menu}...`); }}>
                <Text style={styles.modalOptionText}>{menu}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== MODAL PROFILE (ขวาบน) ==================== */}
      <Modal visible={profileModalVisible} transparent animationType="fade" onRequestClose={() => setProfileModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setProfileModalVisible(false)}>
          <View style={[styles.modalContent, { width: '75%', padding: 20 }]}>
            <View style={styles.profileAvatar}>
              <Ionicons name="person" size={40} color="#fff" />
            </View>
            <Text style={[styles.modalTitle, { marginBottom: 4 }]}>Tapanapong Admin</Text>
            <Text style={{ color: COLORS.textSecondary, marginBottom: 15 }}>admin@myprofileapp.com</Text>
            <View style={{ width: '100%', borderTopWidth: 1, borderColor: COLORS.border, paddingTop: 10 }}>
              <TouchableOpacity style={styles.modalOption} onPress={() => { setProfileModalVisible(false); Alert.alert("Account", "กำลังไปหน้าแก้ไขโปรไฟล์"); }}>
                <Text style={styles.modalOptionText}>⚙️ แก้ไขข้อมูลส่วนตัว</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => { setProfileModalVisible(false); Alert.alert("Logout", "ออกจากระบบสำเร็จ"); }}>
                <Text style={[styles.modalOptionText, { color: 'red' }]}>🚪 ออกจากระบบ</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== MODAL CATEGORIES (ล่างขวา) ==================== */}
      <Modal visible={categoryModalVisible} transparent animationType="slide" onRequestClose={() => setCategoryModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setCategoryModalVisible(false)}>
          <View style={[styles.modalContent, { width: '80%' }]}>
            <Text style={styles.modalTitle}>📂 เลือกหมวดหมู่สินค้า</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSelectCategory("ALL")}>
              <Text style={[styles.modalOptionText, { fontWeight: 'bold', color: COLORS.primary }]}>🌟 ทั้งหมด (All Products)</Text>
            </TouchableOpacity>
            {["Electronics", "Fashion", "Gadgets", "Others"].map((cat, i) => (
              <TouchableOpacity key={i} style={styles.modalOption} onPress={() => handleSelectCategory(cat)}>
                <Text style={styles.modalOptionText}>📦 {cat}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== MODAL FILTER (ตัวกรองราคา) ==================== */}
      <Modal visible={filterModalVisible} transparent animationType="fade" onRequestClose={() => setFilterModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setFilterModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>เรียงลำดับสินค้า</Text>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSort("lowToHigh")}>
              <Text style={styles.modalOptionText}>💵 ราคา: น้อยไปมาก</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={() => handleSort("highToLow")}>
              <Text style={styles.modalOptionText}>💰 ราคา: มากไปน้อย</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalOption, { borderBottomWidth: 0 }]} onPress={() => { setFilteredProducts(products); setFilterModalVisible(false); }}>
              <Text style={[styles.modalOptionText, { color: COLORS.primary }]}>🔄 รีเซ็ตค่าเริ่มต้น</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ==================== MODAL ADD PRODUCT (เพิ่มสินค้า) ==================== */}
      <Modal visible={addModalVisible} transparent animationType="slide" onRequestClose={() => setAddModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { width: "85%", padding: 20 }]}>
            <Text style={styles.modalTitle}>➕ เพิ่มสินค้าใหม่</Text>
            <TextInput placeholder="ชื่อสินค้า" style={styles.modalInput} value={newName} onChangeText={setNewName} />
            <TextInput placeholder="แบรนด์สินค้า" style={styles.modalInput} value={newBrand} onChangeText={setNewBrand} />
            <TextInput placeholder="ราคา (เช่น 450)" keyboardType="numeric" style={styles.modalInput} value={newPrice} onChangeText={setNewPrice} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10, width: '100%' }}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.textSecondary }]} onPress={() => setAddModalVisible(false)}>
                <Text style={styles.modalButtonText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primary }]} onPress={handleAddProduct}>
                <Text style={styles.modalButtonText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView> 
  ); 
}

// การ์ดแสดงรายการสินค้า
const ProductCard = ({ item }: { item: Product }) => {
  const [imgUri, setImgUri] = useState<string>(item.image);

  useEffect(() => {
    setImgUri(item.image);
  }, [item.image]);

  return (
    <View style={styles.card}>
      <Image 
        source={{ uri: imgUri || PLACEHOLDER_IMAGE }} 
        style={styles.image} 
        onError={() => setImgUri(PLACEHOLDER_IMAGE)}
      />
      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
        <Text style={styles.brand}>{item.brand}</Text>
        {item.category && <Text style={[styles.brand, { backgroundColor: COLORS.border, paddingHorizontal: 6, borderRadius: 4, fontSize: 11 }]}>{item.category}</Text>}
      </View>
      <Text style={styles.price}>{item.price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({ 
  container: { flex: 1, backgroundColor: COLORS.background }, 
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 18, backgroundColor: COLORS.background, borderBottomWidth: 1, borderBottomColor: COLORS.border }, 
  headerTitle: { fontSize: 24, fontWeight: "700", color: COLORS.primary }, 
  iconButton: { width: 36, alignItems: "center" }, 
  profileButton: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.primary, justifyContent: "center", alignItems: "center" }, 
  searchRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 18, paddingTop: 18 }, 
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: COLORS.surface, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, paddingHorizontal: 12, height: 48 }, 
  input: { flex: 1, marginLeft: 8, color: COLORS.text }, 
  addButton: { marginLeft: 12, backgroundColor: COLORS.primary, paddingHorizontal: 18, height: 48, borderRadius: 12, justifyContent: "center", elevation: 2 }, 
  addButtonText: { color: "#fff", fontWeight: "700" }, 
  filterRow: { paddingHorizontal: 18, paddingTop: 15 }, 
  filterButton: { alignSelf: "flex-end" }, 
  filterText: { color: COLORS.primary, fontWeight: "600", fontSize: 15 }, 
  listContainer: { flex: 1 },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 14, marginHorizontal: 16, marginVertical: 8, borderWidth: 1, borderColor: COLORS.border, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2 }, 
  image: { width: "100%", height: 180, resizeMode: "contain" }, 
  name: { marginTop: 10, fontSize: 16, fontWeight: "700", color: COLORS.text }, 
  brand: { color: COLORS.textSecondary, fontSize: 13 }, 
  price: { marginTop: 8, fontSize: 18, fontWeight: "700", color: COLORS.primary }, 
  bottomNav: { flexDirection: "row", backgroundColor: COLORS.background, borderTopWidth: 1, borderTopColor: COLORS.border, paddingVertical: 12 }, 
  navItem: { flex: 1, alignItems: "center" }, 
  navText: { marginTop: 4, fontSize: 12, color: COLORS.textSecondary },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  errorText: { color: COLORS.text, fontSize: 15, textAlign: 'center', marginBottom: 15 },
  retryButton: { backgroundColor: COLORS.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryButtonText: { color: '#fff', fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", borderRadius: 16, width: "80%", padding: 16, alignItems: "center", elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: "700", color: COLORS.text, marginBottom: 16, textAlign: "center" },
  modalOption: { width: "100%", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: COLORS.border, alignItems: "center" },
  modalOptionText: { fontSize: 16, color: COLORS.text, fontWeight: "500" },
  modalInput: { width: "100%", height: 44, borderWidth: 1, borderColor: COLORS.border, borderRadius: 8, paddingHorizontal: 12, marginBottom: 12, color: COLORS.text },
  modalButton: { flex: 1, height: 44, borderRadius: 8, justifyContent: "center", alignItems: "center", marginHorizontal: 6 },
  modalButtonText: { color: "#fff", fontWeight: "700" },
  profileAvatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 10 }
});