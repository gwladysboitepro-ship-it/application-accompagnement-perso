import Purchases, { PurchasesOffering, CustomerInfo } from 'react-native-purchases';
import { Platform } from 'react-native';

const API_KEY_IOS = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '';
const API_KEY_ANDROID = process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '';

export const PRODUCT_IDS = {
  monthly: 'vita_monthly',
  annual: 'vita_annual',
} as const;

export async function initRevenueCat(userId: string) {
  const apiKey = Platform.OS === 'ios' ? API_KEY_IOS : API_KEY_ANDROID;
  if (!apiKey) return;

  Purchases.configure({ apiKey });
  await Purchases.logIn(userId);
}

export async function getOfferings(): Promise<PurchasesOffering | null> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current;
  } catch {
    return null;
  }
}

export async function purchaseMonthly(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === PRODUCT_IDS.monthly
    );
    if (!pkg) return false;
    await Purchases.purchasePackage(pkg);
    return true;
  } catch {
    return false;
  }
}

export async function purchaseAnnual(): Promise<boolean> {
  try {
    const offerings = await Purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === PRODUCT_IDS.annual
    );
    if (!pkg) return false;
    await Purchases.purchasePackage(pkg);
    return true;
  } catch {
    return false;
  }
}

export async function checkPremiumStatus(): Promise<{ isPremium: boolean; expiry: string | null }> {
  try {
    const info: CustomerInfo = await Purchases.getCustomerInfo();
    const entitlement = info.entitlements.active['premium'];
    if (entitlement) {
      return { isPremium: true, expiry: entitlement.expirationDate };
    }
    return { isPremium: false, expiry: null };
  } catch {
    return { isPremium: false, expiry: null };
  }
}

export async function restorePurchases(): Promise<boolean> {
  try {
    const info = await Purchases.restorePurchases();
    return !!info.entitlements.active['premium'];
  } catch {
    return false;
  }
}
