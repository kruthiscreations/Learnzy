import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import useSubscriptionAccess from '../utils/useSubscriptionAccess';

interface PaywallProps {
  children: React.ReactNode;
  featureName?: string;
}

export default function Paywall({ children, featureName = 'this feature' }: PaywallProps) {
  const router = useRouter();
  const { access, loading } = useSubscriptionAccess();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Checking subscription...</Text>
      </View>
    );
  }

  if (access?.has_access) {
    return <>{children}</>;
  }

  // Show paywall
  const isTrialExpired = access?.reason === 'trial_expired';
  const isSubscriptionExpired = access?.reason === 'subscription_expired';

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#6366F1', '#8B5CF6', '#A855F7']}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Ionicons name="lock-closed" size={64} color="#fff" />
          </View>
          
          <Text style={styles.title}>
            {isTrialExpired ? 'Free Trial Ended' : 
             isSubscriptionExpired ? 'Subscription Expired' : 
             'Premium Feature'}
          </Text>
          
          <Text style={styles.message}>{access?.message}</Text>
          
          <Text style={styles.subtitle}>
            Subscribe to unlock {featureName} and continue your child's learning journey!
          </Text>

          <View style={styles.features}>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>1,550+ English words</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>AI conversation practice</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Fun learning games</Text>
            </View>
            <View style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
              <Text style={styles.featureText}>Pronunciation coach</Text>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.subscribeButton}
            onPress={() => router.push('/subscription')}
            data-testid="paywall-subscribe-btn"
          >
            <Text style={styles.subscribeButtonText}>
              {isTrialExpired || isSubscriptionExpired ? 'Subscribe Now' : 'Start Free Trial'}
            </Text>
            <Ionicons name="arrow-forward" size={20} color="#6366F1" />
          </TouchableOpacity>

          <Text style={styles.priceText}>Starting at just ₹100/month</Text>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  features: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 300,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureText: {
    marginLeft: 10,
    fontSize: 15,
    color: '#fff',
  },
  subscribeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    gap: 8,
  },
  subscribeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#6366F1',
  },
  priceText: {
    marginTop: 12,
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  backButton: {
    marginTop: 20,
    padding: 12,
  },
  backButtonText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textDecorationLine: 'underline',
  },
});
