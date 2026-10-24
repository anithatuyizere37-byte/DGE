import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import COLORS from '../../constants/colors';
import Header from '../../components/Header';
import Button from '../../components/Button';
import Badge from '../../components/Badge';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { changeAppLanguage } from '../../translations/i18n';

interface ProfileScreenProps {
  navigation: any;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const { user, logout, isOwner } = useAuth();
  const { t, i18n } = useTranslation();

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLanguageName =
    i18n.language === 'rw'
      ? 'Kinyarwanda'
      : i18n.language === 'fr'
      ? 'Français'
      : 'English';

  const selectLanguage = (code: 'en' | 'rw' | 'fr') => {
    changeAppLanguage(code);
    setLangModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Header
        title={t('profile.title').toUpperCase()}
        subtitle={t('common.customerAccount')}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>
              {user?.fullName?.charAt(0) || 'G'}
            </Text>
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.fullName || t('common.guestShopper')}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || t('common.guestBrowsing')}
            </Text>
            {user?.phoneNumber ? (
              <Text style={styles.userPhone}>{user.phoneNumber}</Text>
            ) : null}
            <View style={{ marginTop: 6 }}>
              <Badge
                label={!user ? 'GUEST BROWSING' : isOwner ? 'SHOP OWNER' : 'CLIENT'}
                variant={isOwner ? 'yellow' : 'blue'}
              />
            </View>
          </View>
        </View>

        {/* Menu Options */}
        <View style={styles.menuCard}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setLangModalVisible(true)}
          >
            <View style={{ width: 28, alignItems: 'center', marginRight: 10 }}>
              <Ionicons name="globe-outline" size={20} color={COLORS.blue} />
            </View>
            <View style={styles.menuLabelWrapper}>
              <Text style={styles.menuLabel}>{t('profile.language')}</Text>
              <Text style={styles.menuValue}>{currentLanguageName}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.blue} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => navigation.navigate('OrdersTab')}
          >
            <View style={{ width: 28, alignItems: 'center', marginRight: 10 }}>
              <Ionicons name="receipt-outline" size={20} color={COLORS.blue} />
            </View>
            <View style={styles.menuLabelWrapper}>
              <Text style={styles.menuLabel}>{t('nav.orders')}</Text>
              <Text style={styles.menuValue}>{t('common.orderHistorySubtitle')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.blue} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => Alert.alert('Saved Address', 'Kigabiro Sector, Rwamagana District')}
          >
            <View style={{ width: 28, alignItems: 'center', marginRight: 10 }}>
              <Ionicons name="location-outline" size={20} color={COLORS.blue} />
            </View>
            <View style={styles.menuLabelWrapper}>
              <Text style={styles.menuLabel}>{t('profile.addresses')}</Text>
              <Text style={styles.menuValue}>{t('common.location')}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={COLORS.blue} />
          </TouchableOpacity>
        </View>

        {/* Information Section */}
        <View style={styles.menuCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>{t('common.aboutTitle')}</Text>
            <Text style={styles.infoDesc}>
              {t('common.aboutText')}
            </Text>
          </View>
          <View style={styles.menuDivider} />
          <View style={styles.infoRow}>
            <Text style={styles.infoTitle}>{t('common.contactHelpdesk')}</Text>
            <Text style={styles.infoDesc}>
              {t('common.contactText')}
            </Text>
          </View>
        </View>

        {/* Authentication Action Button (Sign In if guest, Log Out if authenticated) */}
        {!user ? (
          <View style={{ gap: 10, marginTop: 8 }}>
            <Button
              title={t('auth.login')}
              variant="primary"
              size="large"
              onPress={() => navigation.navigate('Login')}
              style={styles.logoutBtn}
            />
            <Button
              title={t('auth.register')}
              variant="accent"
              size="large"
              onPress={() => navigation.navigate('Register')}
              style={styles.logoutBtn}
            />
          </View>
        ) : (
          <Button
            title={t('auth.logout')}
            variant="outline"
            size="large"
            onPress={() => setLogoutModalVisible(true)}
            style={styles.logoutBtn}
          />
        )}
      </ScrollView>

      {/* Language Picker Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Select Application Language</Text>
            <View style={styles.langList}>
              <TouchableOpacity
                style={[
                  styles.langOption,
                  i18n.language === 'en' && styles.langOptionActive,
                ]}
                onPress={() => selectLanguage('en')}
              >
                <Text style={styles.langName}>English</Text>
                {i18n.language === 'en' && <Ionicons name="checkmark" size={18} color={COLORS.blue} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.langOption,
                  i18n.language === 'rw' && styles.langOptionActive,
                ]}
                onPress={() => selectLanguage('rw')}
              >
                <Text style={styles.langName}>Ikinyarwanda</Text>
                {i18n.language === 'rw' && <Ionicons name="checkmark" size={18} color={COLORS.blue} />}
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.langOption,
                  i18n.language === 'fr' && styles.langOptionActive,
                ]}
                onPress={() => selectLanguage('fr')}
              >
                <Text style={styles.langName}>Français</Text>
                {i18n.language === 'fr' && <Ionicons name="checkmark" size={18} color={COLORS.blue} />}
              </TouchableOpacity>
            </View>
            <Button
              title={t('common.cancel')}
              variant="outline"
              onPress={() => setLangModalVisible(false)}
              style={{ width: '100%', marginTop: 12 }}
            />
          </View>
        </View>
      </Modal>

      {/* Logout Confirmation Modal */}
      <Modal
        visible={logoutModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLogoutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{t('auth.logout')}</Text>
            <Text style={styles.modalMessage}>{t('auth.logoutConfirm')}</Text>
            <View style={styles.modalActions}>
              <Button
                title={t('common.cancel')}
                variant="outline"
                onPress={() => setLogoutModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title={t('auth.logout')}
                variant="primary"
                onPress={() => {
                  setLogoutModalVisible(false);
                  logout();
                }}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  userCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: COLORS.blue,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 13,
    color: COLORS.blue,
    opacity: 0.85,
  },
  userPhone: {
    fontSize: 12,
    color: COLORS.blue,
    fontWeight: '600',
    marginTop: 2,
  },
  menuCard: {
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 2,
    borderRadius: 14,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  menuLabelWrapper: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
  },
  menuValue: {
    fontSize: 12,
    color: COLORS.blue,
    opacity: 0.8,
    marginTop: 2,
  },
  arrow: {
    fontSize: 20,
    color: COLORS.blue,
    fontWeight: 'bold',
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.blue,
    opacity: 0.25,
  },
  infoRow: {
    paddingVertical: 12,
  },
  infoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.blue,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 12,
    color: COLORS.blue,
    lineHeight: 18,
    opacity: 0.85,
  },
  logoutBtn: {
    width: '100%',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(21, 101, 192, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalBox: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderColor: COLORS.blue,
    borderWidth: 3,
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: COLORS.blue,
    marginBottom: 8,
  },
  modalMessage: {
    fontSize: 13,
    color: COLORS.blue,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  langList: {
    width: '100%',
    gap: 10,
    marginVertical: 10,
  },
  langOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: COLORS.blue,
  },
  langOptionActive: {
    backgroundColor: COLORS.yellow,
    borderColor: COLORS.blue,
  },
  langName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.blue,
  },
  langCheck: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.blue,
  },
});

export default ProfileScreen;
