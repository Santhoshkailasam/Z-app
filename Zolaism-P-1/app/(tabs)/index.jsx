import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import debounce from "lodash.debounce";
import { getWorkerProfile } from "../../services/workerService";
import { getFilteredLoans } from "../../services/loanServices";

export default function Dashboard() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [loans, setLoans] = useState([]);
  const [searchError, setSearchError] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const tamilQuotes = [
    "வெற்றி நிச்சயம், முயற்சி தொடர்ந்தால்!",
    "தோல்வி தான் வெற்றியின் ஆசிரியர்.",
    "முயற்சித்தால் முடியாதது எதுவுமில்லை.",
    "நம்பிக்கை தான் வாழ்க்கையின் சக்தி.",
  ];

  const quoteOfTheDay = tamilQuotes.length
    ? tamilQuotes[new Date().getDate() % tamilQuotes.length]
    : "Welcome!";

  const getFirstLetter = () => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getWorkerProfile();
        setUsername(profile?.name || profile?.username || "User");
      } catch (error) {
        console.error("Error loading profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSearch = async (text) => {
    setSearchQuery(text);
    setSearchError("");

    if (text.trim().length > 0) {
      setIsSearching(true);
      try {
        const loansData = await getFilteredLoans(text);

        let filteredLoans = [];

        if (Array.isArray(loansData)) {
          filteredLoans = loansData.filter(loan =>
            loan.loan_no?.toLowerCase().includes(text.toLowerCase())
          );
        } else if (loansData && Array.isArray(loansData.results)) {
          filteredLoans = loansData.results.filter(loan =>
            loan.loan_no?.toLowerCase().includes(text.toLowerCase())
          );
        }

        setLoans(filteredLoans);
        if (filteredLoans.length === 0) setSearchError("No results found");
      } catch (error) {
        console.error("Search failed:", error);
        setLoans([]);
        setSearchError("Failed to fetch loans. Please try again.");
      } finally {
        setIsSearching(false);
      }
    } else {
      setLoans([]);
    }
  };


  // Loading indicator while fetching profile
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B2323" />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 👤 Greeting Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Vanakkam, {username} 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleString()}</Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/Profile")}
          style={styles.profileIcon}
        >
          <Text style={styles.profileLetter}>{getFirstLetter()}</Text>
        </TouchableOpacity>
      </View>
      {/* 🔍 Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons
            name="search"
            size={24}
            color="#000000ff"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by Loan ID or No"
            placeholderTextColor="rgba(0,0,0,0.6)"
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={22} color="#000000ff" />
            </TouchableOpacity>
          )}
          {isSearching && <ActivityIndicator size="small" color="#8B2323" />}
        </View>
      </View>

      <Text style={styles.dashboardTitle}>Dashboard</Text>
      <View style={styles.dashboardUnderline} />

      <View style={styles.quoteContainer}>
        <Text style={styles.quoteLabel}>Quote of the Day</Text>
        <Text style={styles.quoteText}>"{quoteOfTheDay}"</Text>
      </View>

      {/* Loan Results */}
      {searchQuery.trim().length > 0 && (
        <View style={styles.resultsContainer}>
          {isSearching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#8B2323" />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          ) : searchError ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle-outline" size={48} color="#ff4444" />
              <Text style={styles.errorText}>{searchError}</Text>
            </View>
          ) : loans.length > 0 ? (
            loans.map((loan, index) => (
              <TouchableOpacity
                key={loan.loan_no || index}
                style={styles.loanCard}
               onPress={() => router.push(`/loan/${loan.loan_no}`)}
              >
                <View style={styles.cardTopRow}>
                  {/* 🔵 Borrower Initial */}
                  <View style={styles.logoContainer}>
                    <Text style={styles.logoText}>
                      {loan.borrower_name ? loan.borrower_name.charAt(0).toUpperCase() : "?"}
                    </Text>
                  </View>
                  <Text style={styles.loanCompanyName}>
                    {loan.borrower_name || "N/A"}
                  </Text>
                  <Text style={styles.loanIDText}>Loan ID: {loan.loan_no}</Text>
                  <Ionicons name="chevron-forward" size={24} color="#ffffffff" />
                </View>
                {loan.amount && (
                  <Text style={styles.loanAmount}>
                    Amount: ₹{loan.amount.toLocaleString()}
                  </Text>
                )}
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.noResultsContainer}>
              <Ionicons name="document-text-outline" size={48} color="#999" />
              <Text style={styles.noResults}>No loans found</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#ffffff',
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B2323',
    marginBottom: 5,
  },
  date: {
    fontSize: 15,
    color: '#666',
  },
  profileIcon: {
    width: 55,
    height: 55,
    borderRadius: 27.5,
    backgroundColor: '#8B2323',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileLetter: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },

  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',

    // 🔹 Glassmorphism background
    backgroundColor: 'rgba(84, 82, 82, 0.15)', // softer white tint
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 10,

    // 🔹 Shadows for depth
    shadowColor: '#ffffff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,

    // 🔹 Subtle border for edge definition
    borderWidth: 0.8,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },

  searchIcon: {
    marginRight: 10,
    opacity: 0.9,
  },

  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#000000ff',
    paddingVertical: 10, // 👈 bigger touch area
    minHeight: 40,
    letterSpacing: 0.3,
  },

  dashboardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B2323',
    paddingHorizontal: 20,
    marginBottom: 15,
    letterSpacing: 2,
  },

  quoteContainer: {
    backgroundColor: '#8B2323',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  quoteText: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '600',
    lineHeight: 26,
    textAlign: 'center',
  },
  quoteLabel: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.8,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  logoText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  resultsContainer: {
    paddingHorizontal: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#ff4444',
    textAlign: 'center',
  },
  loanCard: {
    backgroundColor: "#8B2323",
    borderRadius: 15,
    padding: 15,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },

  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  loanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  loanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffffff',
  },
  loanCompanyName: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
    marginLeft: 10,
  },
  loanIDText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  loanAmount: {
    color: "#fff",
    marginTop: 8,
    fontSize: 15,
    fontWeight: "500",
  },

  noResultsContainer: {
    padding: 40,
    alignItems: 'center',
  },
  noResults: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
});