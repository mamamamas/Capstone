// StockScreenStyles.js
import { StyleSheet } from 'react-native';
import Colors from '../../constants/Colors';

const styles = StyleSheet.create({
  emptyMessage: {
    textAlign: 'center',
    color: 'gray',
    marginVertical: 20,
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  tabSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  tabButton: {
    paddingVertical: 10,
    paddingHorizontal: 19,
    backgroundColor: '#f1f1f1',
    borderRadius: 50,
  },
  activeTab: {
    backgroundColor: Colors.cobaltblue,
  },
  tabText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  activeTabText: {
    color: '#fff',
  },
  topSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    justifyContent: 'space-between',
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 10,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 50,
    marginRight: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 10,
    backgroundColor: '#f9f9f9',
  },
  headerRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    backgroundColor: '#f1f1f1',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  headerText: {
    width: 120,
    fontWeight: 'bold',
    paddingHorizontal: 5,
    textAlign: 'center',
  },
  saveButtonContainer: {
    marginTop: 15, // Add some space above the button
    alignItems: 'center',
  },
  saveButton: {
    padding: 15,
    backgroundColor: Colors.cobaltblue,
    borderRadius: 50,
    width: '45%',
    maxWidth: 350,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center',
  },
});
export default styles;
