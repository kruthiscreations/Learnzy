import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, ActivityIndicator, Platform } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import Constants from 'expo-constants';
import { useAppStore } from '../store/appStore';
import api from '../utils/api';

const BACKEND_URL = Constants.expoConfig?.extra?.backendUrl || process.env.EXPO_PUBLIC_BACKEND_URL;

// Razorpay script loading for web
const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    if (Platform.OS !== 'web') {
      resolve(false);
      return;
    }
    if ((window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function SubscriptionScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { user } = useAppStore();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe'>('razorpay');
  const [razorpayConfig, setRazorpayConfig] = useState<any>(null);

  useEffect(() => {
    loadSubscription();
    loadRazorpayConfig();
  }, []);

  // Handle redirect from Stripe checkout
  useEffect(() => {
    const checkPaymentStatus = async () => {
      const sessionId = params.session_id as string;
      const status = params.status as string;
      
      if (sessionId && status === 'success') {
        setLoading(true);
        try {
          const response = await api.get(`/checkout/status/${sessionId}`);
          if (response.data.payment_status === 'paid') {
            Alert.alert(
              'Payment Successful! 🎉',
              'Your subscription is now active. Enjoy learning!',
              [{ text: 'Great!', onPress: loadSubscription }]
            );
          } else {
            Alert.alert(
              'Payment Processing',
              'Your payment is being processed. Please wait a moment and refresh.',
              [{ text: 'OK', onPress: loadSubscription }]
            );
          }
        } catch (error) {
          console.error('Error checking payment status:', error);
          loadSubscription();
        }
      } else if (status === 'cancelled') {
        Alert.alert('Payment Cancelled', 'You cancelled the payment. You can try again anytime.');
        loadSubscription();
      } else {
        loadSubscription();
      }
    };
    
    checkPaymentStatus();
  }, [params.session_id, params.status]);

  const loadSubscription = async () => {
    try {
      if (user) {
        const response = await api.get(`/subscription/${user.user_id}`);
        setSubscription(response.data);
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayConfig = async () => {
    try {
      const response = await api.get('/razorpay/config');
      setRazorpayConfig(response.data);
    } catch (error) {
      console.error('Error loading Razorpay config:', error);
    }
  };

  const handleRazorpayPayment = async () => {
    if (!user) return;
    
    // Check if Razorpay is configured
    if (!razorpayConfig?.configured) {
      Alert.alert(
        'Payment Not Available',
        'Razorpay payments are not configured yet. Please use Stripe or contact support.',
        [{ text: 'Use Stripe', onPress: () => setPaymentMethod('stripe') }]
      );
      return;
    }
    
    setProcessing(true);
    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded && Platform.OS === 'web') {
        Alert.alert('Error', 'Failed to load payment gateway. Please try again.');
        setProcessing(false);
        return;
      }

      // Create order on backend
      const orderResponse = await api.post('/razorpay/create-order', {
        user_id: user.user_id,
        plan: selectedPlan
      });

      const { order_id, amount, currency, key_id, user_name, user_phone } = orderResponse.data;

      if (Platform.OS === 'web') {
        // Web: Use Razorpay checkout.js
        const options = {
          key: key_id,
          amount: amount,
          currency: currency,
          name: 'Learnzy',
          description: `${selectedPlan === 'monthly' ? 'Monthly' : 'Yearly'} Subscription`,
          order_id: order_id,
          handler: async function (response: any) {
            try {
              // Verify payment
              const verifyResponse = await api.post('/razorpay/verify-payment', {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                user_id: user.user_id,
                plan: selectedPlan
              });

              if (verifyResponse.data.success) {
                Alert.alert(
                  'Payment Successful! 🎉',
                  'Your subscription is now active. Enjoy learning!',
                  [{ text: 'Great!', onPress: loadSubscription }]
                );
              }
            } catch (error) {
              console.error('Verification error:', error);
              Alert.alert('Error', 'Payment verification failed. Please contact support.');
            }
            setProcessing(false);
          },
          prefill: {
            name: user_name || user.name,
            contact: user_phone || user.phone_number,
          },
          theme: {
            color: '#6366F1'
          },
          modal: {
            ondismiss: function() {
              setProcessing(false);
            }
          }
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.on('payment.failed', function (response: any) {
          Alert.alert('Payment Failed', response.error.description || 'Payment was not successful');
          setProcessing(false);
        });
        razorpay.open();
      } else {
        // Mobile: Use native Razorpay SDK (would need react-native-razorpay)
        Alert.alert('Info', 'Razorpay native integration coming soon. Please use Stripe for now.');
        setProcessing(false);
      }
    } catch (error: any) {
      console.error('Razorpay error:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to start payment. Please try again.');
      setProcessing(false);
    }
  };

  const handleStripePayment = async () => {
    if (!user) return;
    
    setProcessing(true);
    try {
      const originUrl = Platform.OS === 'web' 
        ? window.location.origin 
        : BACKEND_URL;
      
      const response = await api.post('/checkout', {
        user_id: user.user_id,
        plan: selectedPlan,
        origin_url: originUrl
      });
      
      const checkoutUrl = response.data.url;
      
      if (Platform.OS === 'web') {
        window.location.href = checkoutUrl;
      } else {
        const result = await WebBrowser.openBrowserAsync(checkoutUrl);
        if (result.type === 'cancel') {
          await loadSubscription();
        }
      }
    } catch (error: any) {
      console.error('Checkout error:', error);
      Alert.alert('Error', error.response?.data?.detail || 'Failed to start checkout. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const handleSubscribe = () => {
    if (paymentMethod === 'razorpay') {
      handleRazorpayPayment();
    } else {
      handleStripePayment();
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      'Cancel Subscription?',
      'Are you sure you want to cancel your subscription?',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.post(`/cancel-subscription/${user?.user_id}`);
              Alert.alert('Cancelled', 'Your subscription has been cancelled.');
              loadSubscription();
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
      </View>
    );
  }

  const isTrialOrExpired = !subscription || subscription?.plan === 'trial' || subscription?.status === 'cancelled';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6']}
        style={styles.header}
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton} data-testid="back-btn">
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Subscription</Text>
        <View style={{ width: 28 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Current Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons 
              name={subscription?.status === 'active' ? 'checkmark-circle' : 'alert-circle'} 
              size={32} 
              color={subscription?.status === 'active' ? '#10B981' : '#F59E0B'} 
            />
            <Text style={styles.statusTitle}>
              {subscription?.plan === 'trial' ? 'Free Trial' : 
               subscription?.plan === 'monthly' ? 'Monthly Plan' :
               subscription?.plan === 'yearly' ? 'Yearly Plan' : 'No Plan'}
            </Text>
          </View>
          
          {subscription?.days_remaining !== undefined && subscription?.days_remaining >= 0 && (
            <Text style={styles.daysRemaining}>
              {subscription.days_remaining} days remaining
            </Text>
          )}
          
          {subscription?.status === 'cancelled' && (
            <Text style={styles.cancelledText}>Subscription cancelled</Text>
          )}
        </View>

        {/* Plans */}
        {isTrialOrExpired && (
          <>
            <Text style={styles.sectionTitle}>Choose a Plan</Text>
            
            {/* Monthly Plan */}
            <TouchableOpacity 
              style={[styles.planCard, selectedPlan === 'monthly' && styles.selectedPlan]}
              onPress={() => setSelectedPlan('monthly')}
              data-testid="monthly-plan"
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Monthly</Text>
                {selectedPlan === 'monthly' && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </View>
              <Text style={styles.planPrice}>₹100<Text style={styles.planPeriod}>/month</Text></Text>
              <Text style={styles.planFeature}>• Full access to all words</Text>
              <Text style={styles.planFeature}>• All games unlocked</Text>
              <Text style={styles.planFeature}>• AI conversation practice</Text>
              <Text style={styles.planFeature}>• Cancel anytime</Text>
            </TouchableOpacity>

            {/* Yearly Plan */}
            <TouchableOpacity 
              style={[styles.planCard, selectedPlan === 'yearly' && styles.selectedPlan]}
              onPress={() => setSelectedPlan('yearly')}
              data-testid="yearly-plan"
            >
              <View style={styles.bestValue}>
                <Text style={styles.bestValueText}>BEST VALUE</Text>
              </View>
              <View style={styles.planHeader}>
                <Text style={styles.planName}>Yearly</Text>
                {selectedPlan === 'yearly' && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </View>
              <Text style={styles.planPrice}>₹1000<Text style={styles.planPeriod}>/year</Text></Text>
              <Text style={styles.savingsText}>Save ₹200 (2 months free!)</Text>
              <Text style={styles.planFeature}>• Everything in Monthly</Text>
              <Text style={styles.planFeature}>• Priority support</Text>
              <Text style={styles.planFeature}>• New features first</Text>
            </TouchableOpacity>

            {/* Payment Method Selection */}
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <View style={styles.paymentMethods}>
              {/* Razorpay Option */}
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'razorpay' && styles.selectedPayment]}
                onPress={() => setPaymentMethod('razorpay')}
                data-testid="razorpay-option"
              >
                <View style={styles.paymentOptionContent}>
                  <View style={styles.paymentIconContainer}>
                    <Text style={styles.paymentIcon}>🇮🇳</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>Razorpay</Text>
                    <Text style={styles.paymentDesc}>UPI, Cards, Netbanking</Text>
                  </View>
                </View>
                {paymentMethod === 'razorpay' && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </TouchableOpacity>

              {/* Stripe Option */}
              <TouchableOpacity 
                style={[styles.paymentOption, paymentMethod === 'stripe' && styles.selectedPayment]}
                onPress={() => setPaymentMethod('stripe')}
                data-testid="stripe-option"
              >
                <View style={styles.paymentOptionContent}>
                  <View style={[styles.paymentIconContainer, { backgroundColor: '#635BFF20' }]}>
                    <Text style={styles.paymentIcon}>💳</Text>
                  </View>
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentName}>Stripe</Text>
                    <Text style={styles.paymentDesc}>International Cards</Text>
                  </View>
                </View>
                {paymentMethod === 'stripe' && (
                  <Ionicons name="checkmark-circle" size={24} color="#6366F1" />
                )}
              </TouchableOpacity>
            </View>

            {/* Subscribe Button */}
            <TouchableOpacity 
              style={styles.subscribeButton}
              onPress={handleSubscribe}
              disabled={processing}
              data-testid="subscribe-button"
            >
              <LinearGradient
                colors={paymentMethod === 'razorpay' ? ['#2563EB', '#1D4ED8'] : ['#6366F1', '#8B5CF6']}
                style={styles.subscribeGradient}
              >
                {processing ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.subscribeText}>
                      Pay with {paymentMethod === 'razorpay' ? 'Razorpay' : 'Stripe'}
                    </Text>
                    <Ionicons 
                      name={paymentMethod === 'razorpay' ? 'wallet-outline' : 'card-outline'} 
                      size={20} 
                      color="#fff" 
                      style={{ marginLeft: 8 }} 
                    />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {/* Security Notice */}
            <View style={styles.securityNotice}>
              <Ionicons name="shield-checkmark" size={20} color="#10B981" />
              <Text style={styles.securityText}>
                {paymentMethod === 'razorpay' 
                  ? 'Secured by Razorpay. Supports UPI, Debit/Credit Cards, Netbanking.'
                  : 'Secured by Stripe. Your payment info is encrypted and safe.'}
              </Text>
            </View>
          </>
        )}

        {/* Cancel Button for Active Subscriptions */}
        {subscription?.status === 'active' && subscription?.plan !== 'trial' && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancel} data-testid="cancel-btn">
            <Text style={styles.cancelButtonText}>Cancel Subscription</Text>
          </TouchableOpacity>
        )}

        {/* Features List */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You Get</Text>
          
          <View style={styles.featureItem}>
            <Ionicons name="book" size={24} color="#10B981" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>1,550+ Words</Text>
              <Text style={styles.featureDesc}>Comprehensive vocabulary for all levels</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="chatbubbles" size={24} color="#6366F1" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Conversations</Text>
              <Text style={styles.featureDesc}>Practice speaking with fun characters</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="game-controller" size={24} color="#F59E0B" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>4 Learning Games</Text>
              <Text style={styles.featureDesc}>Flashcards, Quiz, Crossword, Dictation</Text>
            </View>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="mic" size={24} color="#EF4444" />
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Pronunciation Coach</Text>
              <Text style={styles.featureDesc}>AI-powered speech analysis</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    boxShadow: '0px 2px 8px rgba(0,0,0,0.08)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  daysRemaining: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
  cancelledText: {
    marginTop: 8,
    fontSize: 14,
    color: '#EF4444',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
    marginTop: 8,
  },
  planCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  selectedPlan: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  planPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#6366F1',
    marginBottom: 12,
  },
  planPeriod: {
    fontSize: 16,
    fontWeight: 'normal',
    color: '#6B7280',
  },
  planFeature: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 4,
  },
  bestValue: {
    position: 'absolute',
    top: -10,
    right: 16,
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bestValueText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  savingsText: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  paymentMethods: {
    marginBottom: 16,
  },
  paymentOption: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedPayment: {
    borderColor: '#6366F1',
    backgroundColor: '#F5F3FF',
  },
  paymentOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#2563EB20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  paymentIcon: {
    fontSize: 22,
  },
  paymentInfo: {
    flex: 1,
  },
  paymentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
  subscribeButton: {
    marginBottom: 12,
    borderRadius: 14,
    overflow: 'hidden',
  },
  subscribeGradient: {
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  subscribeText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  securityText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 13,
    color: '#065F46',
  },
  cancelButton: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  cancelButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  featureContent: {
    marginLeft: 12,
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  featureDesc: {
    fontSize: 13,
    color: '#6B7280',
  },
});
