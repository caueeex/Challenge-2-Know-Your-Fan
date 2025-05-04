import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../context/AuthContext';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, PieChart } from 'react-native-chart-kit';
import { Dimensions } from 'react-native';

const AdminDashboardScreen = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.isAdmin) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    
    try {
      // Aqui você buscaria os dados do backend
      // Por simplicidade, estamos usando dados mockados
      
      // Mock de usuários
      setUsers([
        { id: 1, name: 'João Silva', email: 'joao@exemplo.com', isAdmin: false },
        { id: 2, name: 'Maria Souza', email: 'maria@exemplo.com', isAdmin: true },
        { id: 3, name: 'Carlos Oliveira', email: 'carlos@exemplo.com', isAdmin: false },
        { id: 4, name: 'Ana Santos', email: 'ana@exemplo.com', isAdmin: false },
        { id: 5, name: 'Pedro Costa', email: 'pedro@exemplo.com', isAdmin: false },
      ]);
      
      // Mock de logs
      setLogs([
        { id: 1, userName: 'João Silva', action: 'Atualizou perfil', timestamp: '2023-05-01 14:30' },
        { id: 2, userName: 'Maria Souza', action: 'Adicionou link de e-sports', timestamp: '2023-05-01 15:45' },
        { id: 3, userName: 'Carlos Oliveira', action: 'Registrou nova conta', timestamp: '2023-05-02 09:15' },
        { id: 4, userName: 'Ana Santos', action: 'Enviou documento', timestamp: '2023-05-02 11:20' },
        { id: 5, userName: 'Pedro Costa', action: 'Conectou rede social', timestamp: '2023-05-03 16:30' },
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = (userId) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isAdmin: !user.isAdmin } : user
    ));
  };

  const screenWidth = Dimensions.get('window').width;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Painel de Administração</Text>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{users.length}</Text>
            <Text style={styles.statLabel}>Usuários</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{users.filter(u => u.isAdmin).length}</Text>
            <Text style={styles.statLabel}>Administradores</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{logs.length}</Text>
            <Text style={styles.statLabel}>Atividades</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades Recentes</Text>
          
          <BarChart
            data={{
              labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai'],
              datasets: [
                {
                  data: [20, 45, 28, 80, 35],
                },
              ],
            }}
            width={screenWidth - 40}
            height={200}
            yAxisLabel=""
            chartConfig={{
              backgroundColor: colors.dark,
              backgroundGradientFrom: colors.dark,
              backgroundGradientTo: colors.dark,
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(255, 165, 0, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Distribuição de Usuários</Text>
          
          <PieChart
            data={[
              {
                name: 'Administradores',
                population: users.filter(u => u.isAdmin).length,
                color: colors.primary,
                legendFontColor: colors.light,
                legendFontSize: 12,
              },
              {
                name: 'Usuários Comuns',
                population: users.filter(u => !u.isAdmin).length,
                color: colors.gray,
                legendFontColor: colors.light,
                legendFontSize: 12,
              },
            ]}
            width={screenWidth - 40}
            height={150}
            chartConfig={{
              backgroundColor: colors.dark,
              backgroundGradientFrom: colors.dark,
              backgroundGradientTo: colors.dark,
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            absolute
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gerenciar Usuários</Text>
          
          {users.map((user) => (
            <View key={user.id} style={styles.userItem}>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.name}</Text>
                <Text style={styles.userEmail}>{user.email}</Text>
              </View>
              
              <TouchableOpacity
                onPress={() => toggleAdmin(user.id)}
                style={[
                  styles.adminButton,
                  user.isAdmin && styles.adminButtonActive,
                ]}
              >
                <Ionicons 
                  name={user.isAdmin ? 'shield' : 'shield-outline'} 
                  size={20} 
                  color={user.isAdmin ? colors.primary : colors.light} 
                />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Logs de Atividades</Text>
          
          {logs.map((log) => (
            <View key={log.id} style={styles.logItem}>
              <View style={styles.logInfo}>
                <Text style={styles.logUser}>{log.userName}</Text>
                <Text style={styles.logAction}>{log.action}</Text>
              </View>
              <Text style={styles.logTime}>{log.timestamp}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
  },
  statLabel: {
    fontSize: 14,
    color: colors.light,
    marginTop: 5,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.light,
    marginBottom: 15,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    color: colors.light,
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: colors.gray,
  },
  adminButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray,
  },
  adminButtonActive: {
    borderColor: colors.primary,
  },
  logItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.darkGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
  },
  logInfo: {
    flex: 1,
  },
  logUser: {
    fontSize: 16,
    color: colors.primary,
    marginBottom: 5,
  },
  logAction: {
    fontSize: 14,
    color: colors.light,
  },
  logTime: {
    fontSize: 12,
    color: colors.gray,
  },
});

export default AdminDashboardScreen;