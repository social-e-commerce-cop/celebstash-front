// screens/TransactionsSearch.tsx
import React, { useState } from "react";
import {
    View,
    TextInput,
    StyleSheet,
    FlatList,
    Text,
    Image,
    Dimensions,
    TouchableOpacity,
    StatusBar
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SearchIcon } from "@/assets/icons/Payment";

const { width, height } = Dimensions.get("window");

// Dummy data
const transactions = [
    {
        id: "1",
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction1.jpg"),
    },
    {
        id: "2",
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction2.jpg"),
    },
     {
        id: "3",
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction3.jpg"),
    },
    {
        id: "4",
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction4.jpg"),
    },
     {
        id: "5",
        title: "Kivumbi Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction5.jpg"),
    },
    {
        id: "6",
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024 | 08:40 AM",
        amount: "$150.000",
        image: require("@/assets/images/wallet/transaction1.jpg"),
    },
];

const TransactionsSearch: React.FC = () => {
    const navigation = useNavigation<StackNavigationProp<any>>();
    const [query, setQuery] = useState("");
    const [showSearch, setShowSearch] = useState(false);

    const filteredData = transactions.filter((item) =>
        item.title.toLowerCase().includes(query.toLowerCase())
    );

    const handleItemPress = (item: typeof transactions[0]) => {
        navigation.navigate("TransactionDetails", { transaction: item });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#000" />
            {/* Header */}
            <View style={styles.headerOverlay}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
                    <Ionicons name="arrow-back" size={width * 0.06} color="#000" />
                </TouchableOpacity>

                <Text style={[styles.headerTitle, { fontSize: width * 0.045 }]}>Transaction History</Text>

                <TouchableOpacity onPress={() => setShowSearch(!showSearch)} style={styles.iconButton}>
                    <SearchIcon  />
                </TouchableOpacity>
            </View>

            {/* Conditionally show search input */}
            {showSearch && (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search transactions..."
                    value={query}
                    onChangeText={setQuery}
                />
            )}

            {/* Transactions list */}
            <FlatList
                data={filteredData}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: height * 0.05 }}
                renderItem={({ item }) => (
                    <TouchableOpacity style={styles.itemRow} onPress={() => handleItemPress(item)}>
                        <Image source={item.image} style={styles.itemImage} />
                        <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={1}>{item.title}</Text>
                            <Text style={styles.itemDate}>{item.date}</Text>
                        </View>
                        <Text style={styles.itemAmount}>{item.amount}</Text>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

export default TransactionsSearch;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        paddingHorizontal: width * 0.04,
        paddingTop: height * 0.04,
    },
    searchInput: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: width * 0.02,
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.04,
        marginBottom: height * 0.03,
        fontSize: width * 0.04,
    },
    itemRow: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: height * 0.02,
    },
    itemImage: {
        width: width * 0.15,
        height: width * 0.15,
        borderRadius: (width * 0.15) / 2,
        marginRight: width * 0.03,
    },
    itemInfo: {
        flex: 1,
    },
    itemTitle: {
        fontWeight: "600",
        fontSize: width * 0.042,
        color: "#1D1E20",
    },
    itemDate: {
        color: "#8A8A8A",
        fontSize: width * 0.035,
        marginTop: height * 0.003,
    },
    itemAmount: {
        fontWeight: "bold",
        fontSize: width * 0.042,
        color: "#1D1E20",
    },
    headerOverlay: {
        height: height * 0.07,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: height * 0.02,
    },
    headerTitle: {
        color: "#000",
        fontWeight: "bold",
    },
    iconButton: {},
});
