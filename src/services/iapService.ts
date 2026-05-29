import Purchases, {
  PurchasesOffering,
  PurchasesPackage,
  CustomerInfo,
  LOG_LEVEL,
} from 'react-native-purchases';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────
// Replace these with your actual RevenueCat API keys from https://app.revenuecat.com
const REVENUECAT_IOS_API_KEY = 'appl_REPLACE_WITH_YOUR_REVENUECAT_IOS_KEY';

// The entitlement identifier you configure in the RevenueCat dashboard
const ENTITLEMENT_PRO = 'pro';

// AsyncStorage key for caching subscription status (avoids a network call on launch)
const SUBSCRIPTION_STATUS_KEY = '@nayl_is_pro';

class IAPService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;
    try {
      if (__DEV__) {
        await Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }
      Purchases.configure({ apiKey: REVENUECAT_IOS_API_KEY });
      this.initialized = true;
    } catch (error) {
      console.error('RevenueCat initialization error:', error);
    }
  }

  async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      await this.initialize();
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Error fetching offerings:', error);
      return null;
    }
  }

  async purchasePackage(pkg: PurchasesPackage): Promise<{ success: boolean; customerInfo?: CustomerInfo; userCancelled?: boolean }> {
    try {
      await this.initialize();
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, JSON.stringify(isPro));
      return { success: isPro, customerInfo };
    } catch (error: any) {
      if (error.userCancelled) {
        return { success: false, userCancelled: true };
      }
      console.error('Purchase error:', error);
      throw error;
    }
  }

  async restorePurchases(): Promise<{ success: boolean; customerInfo?: CustomerInfo }> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.restorePurchases();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, JSON.stringify(isPro));
      return { success: isPro, customerInfo };
    } catch (error) {
      console.error('Restore purchases error:', error);
      throw error;
    }
  }

  async isProUser(): Promise<boolean> {
    try {
      await this.initialize();
      const customerInfo = await Purchases.getCustomerInfo();
      const isPro = typeof customerInfo.entitlements.active[ENTITLEMENT_PRO] !== 'undefined';
      await AsyncStorage.setItem(SUBSCRIPTION_STATUS_KEY, JSON.stringify(isPro));
      return isPro;
    } catch (error) {
      // Fall back to cached value
      const cached = await AsyncStorage.getItem(SUBSCRIPTION_STATUS_KEY);
      if (cached !== null) return JSON.parse(cached);
      return false;
    }
  }
}

export default new IAPService();
