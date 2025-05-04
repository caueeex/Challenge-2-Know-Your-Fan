import React from 'react';
import { View, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import Text from '../components/Text';
import { colors } from '../constants/theme';
import * as Animatable from 'react-native-animatable';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const HomeScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={[colors.dark, colors.darkGray]}
        style={styles.content}
      >
        <Animatable.View 
          animation="zoomIn" 
          duration={1200}
          style={styles.header}
        >
          <Image 
            source={require('../assets/furia-banner.png')} 
            style={styles.banner} 
            resizeMode="cover"
          />
          <Text style={styles.title}>Bem-vindo ao FuriaApp</Text>
          <Text style={styles.subtitle}>Sua conexão com o universo FURIA</Text>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Próximos Jogos</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="calendar-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.match}>
            <View style={styles.matchInfo}>
              <Text style={styles.matchText}>FURIA vs MIBR</Text>
              <Text style={styles.matchSubtitle}>Campeonato Brasileiro</Text>
            </View>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={styles.matchDateBadge}
            >
              <Text style={styles.matchDate}>Hoje - 20:00</Text>
            </LinearGradient>
          </View>
          <View style={styles.match}>
            <View style={styles.matchInfo}>
              <Text style={styles.matchText}>FURIA vs LOUD</Text>
              <Text style={styles.matchSubtitle}>Liga Principal</Text>
            </View>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={styles.matchDateBadge}
            >
              <Text style={styles.matchDate}>Amanhã - 19:00</Text>
            </LinearGradient>
          </View>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          delay={200}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Notícias</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="newspaper-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <LinearGradient
            colors={['#ffffff20', '#ffffff05']}
            style={styles.newsContainer}
          >
            <Text style={styles.newsTitle}>Nova Contratação!</Text>
            <Text style={styles.newsText}>
              FURIA anuncia reforço para o time de CS:GO. Confira todos os detalhes no nosso site oficial!
            </Text>
            <TouchableOpacity style={styles.readMoreButton}>
              <Text style={styles.readMoreText}>Leia Mais</Text>
            </TouchableOpacity>
          </LinearGradient>
        </Animatable.View>
        
        <Animatable.View 
          animation="fadeInUp" 
          duration={1000}
          delay={400}
          style={styles.card}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Eventos</Text>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="star-outline" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.eventItem}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} style={styles.eventIcon} />
            <View>
              <Text style={styles.eventText}>Encontro de torcedores</Text>
              <Text style={styles.eventDate}>15/05 - 18:00</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={styles.eventItem}>
            <Ionicons name="chevron-forward" size={20} color={colors.primary} style={styles.eventIcon} />
            <View>
              <Text style={styles.eventText}>Campeonato interno</Text>
              <Text style={styles.eventDate}>20/05 - 14:00</Text>
            </View>
          </TouchableOpacity>
        </Animatable.View>
      </LinearGradient>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.dark,
  },
  content: {
    padding: 16,
    paddingBottom: 48,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 24,
    borderRadius: 16,
    backgroundColor: colors.darkGray + 'CC',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  banner: {
    width: '100%',
    height: 200,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.primary,
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: colors.primary + '50',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  subtitle: {
    fontSize: 18,
    color: colors.light,
    opacity: 0.9,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.darkGray + 'E6',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: colors.primary + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.primary,
  },
  iconButton: {
    padding: 8,
    backgroundColor: colors.primary + '20',
    borderRadius: 12,
  },
  match: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.dark + 'CC',
    borderWidth: 1,
    borderColor: colors.primary + '10',
  },
  matchInfo: {
    flex: 1,
    marginRight: 12,
  },
  matchText: {
    fontSize: 16,
    color: colors.light,
    fontWeight: '700',
  },
  matchSubtitle: {
    fontSize: 14,
    color: colors.light + '80',
    marginTop: 4,
  },
  matchDateBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  matchDate: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '700',
  },
  newsContainer: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary + '10',
  },
  newsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 8,
  },
  newsText: {
    fontSize: 16,
    color: colors.light,
    lineHeight: 24,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  readMoreText: {
    fontSize: 14,
    color: colors.dark,
    fontWeight: '600',
  },
  eventItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    backgroundColor: colors.dark + 'CC',
    borderWidth: 1,
    borderColor: colors.primary + '10',
  },
  eventIcon: {
    marginRight: 12,
  },
  eventText: {
    fontSize: 16,
    color: colors.light,
    fontWeight: '600',
  },
  eventDate: {
    fontSize: 14,
    color: colors.light + '80',
    marginTop: 4,
  },
});

export default HomeScreen;