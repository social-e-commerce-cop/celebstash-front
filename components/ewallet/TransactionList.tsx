import React from 'react';
import {
  SectionList,
  StyleSheet,
  Text,
  Dimensions,
  View,
} from 'react-native';
import TransactionItem from './TransactionItem';

const { width } = Dimensions.get('window');

interface TransactionListProps {
  ListHeaderComponent?: React.ReactElement;
  contentContainerStyle?: object;
}

const transactions = [
  {
    date: "12-May-2025",
    data: [
      {
        id: "1",
        image: require("@/assets/images/wallet/transaction1.jpg"),
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024",
        time: "08:40 AM",
        amount: "$150.000",
      },
      {
        id: "2",
         image: require("@/assets/images/wallet/transaction2.jpg"),
        title: "Kendric’s Jacket on Tour",
        date: "May 28,2024",
        time: "08:40 AM",
        amount: "$150.000",
      },
      {
        id: "3",
         image: require("@/assets/images/wallet/transaction3.jpg"),
        title: "Kendric’s Jacket on Tour",
        date: "May 29,2024",
        time: "09:15 AM",
        amount: "$200.000",
      },
    ],
  },
  {
    date: "13-May-2025",
    data: [
      {
        id: "4",
         image: require("@/assets/images/wallet/transaction4.jpg"),
        title: "Kendric’s Jacket on Tour",
        date: "May 29,2024",
        time: "09:15 AM",
        amount: "$200.000",
      },
      {
        id: "5",
         image: require("@/assets/images/wallet/transaction5.jpg"),
        title: "Kendric’s Jacket on Tour",
        date: "May 29,2024",
        time: "09:15 AM",
        amount: "$200.000",
      },
    ],
  },
];

const TransactionList: React.FC<TransactionListProps> = ({
  ListHeaderComponent,
  contentContainerStyle,
}) => {
  return (
    <SectionList
      sections={transactions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TransactionItem
          image={item.image}
          title={item.title}
          date={item.date}
          time={item.time}
          amount={item.amount}
        />
      )}
      renderSectionHeader={({ section: { date } }) => (
        <View style={styles.dateWrapper}>
          <Text style={styles.dateLabel}>{date}</Text>
        </View>
      )}
      ListHeaderComponent={ListHeaderComponent}
      contentContainerStyle={contentContainerStyle}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={true}
    />
  );
};

export default TransactionList;

const styles = StyleSheet.create({
  dateWrapper: {
    backgroundColor: '',
    paddingVertical: 6,
    paddingHorizontal: width * 0.02,
    borderRadius: 6,
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8A8A8A',
  },
});

