import React from 'react';
import { View, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors } from '../constants/theme';
import Text from '../components/Text';

const CustomDrawerContent = (props) => {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <DrawerContentScrollView {...props}>
        <View style={styles.profileContainer}>
          {user?.profilePicture ? (
            <Image source={{ uri: user.profilePicture }} style={styles.profileImage} />
          ) : (
            <View style={styles.profilePlaceholder}>
              <Ionicons name="person" size={40} color={colors.light} />
            </View>
          )}
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{user?.name || 'Usuário'}</Text>
            <Text style={styles.email}>{user?.email || 'email@exemplo.com'}</Text>
          </View>
        </View>
        
        <View style={styles.pointsContainer}>
          <Ionicons name="trophy" size={20} color={colors.primary} />
          <Text style={styles.pointsText}>{user?.points || 0} pontos</Text>
        </View>
        
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      
      <View style={styles.footer}>
        <TouchableOpacity onPress={logout} style={styles.logoutButton}>
          <Ionicons name="log-out" size={24} color={colors.light} />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  profilePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    marginLeft: 15,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
  },
  email: {
    fontSize: 14,
    color: colors.light,
    opacity: 0.7,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'rgba(255, 165, 0, 0.1)',
    marginHorizontal: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  pointsText: {
    marginLeft: 10,
    color: colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: colors.gray,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoutText: {
    marginLeft: 10,
    color: colors.light,
    fontSize: 16,
  },
});

export default CustomDrawerContent;