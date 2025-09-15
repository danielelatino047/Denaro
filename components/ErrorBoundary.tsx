import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, RefreshCw, Copy } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: string;
  timestamp?: string;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    console.error('ErrorBoundary caught an error:', error);
    const timestamp = new Date().toISOString();
    return { 
      hasError: true, 
      error,
      timestamp
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('ErrorBoundary componentDidCatch:', error, errorInfo);
    
    // Store detailed error info
    this.setState({
      errorInfo: errorInfo.componentStack || 'No component stack available'
    });
    
    // Log to console with full details
    console.error('=== ERROR BOUNDARY DETAILS ===');
    console.error('Error:', error.name, error.message);
    console.error('Stack:', error.stack);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Timestamp:', this.state.timestamp);
    console.error('==============================');
  }

  handleReset = () => {
    console.log('ErrorBoundary: Resetting error state');
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      timestamp: undefined 
    });
  };

  handleCopyError = () => {
    const errorDetails = {
      error: this.state.error?.message || 'Unknown error',
      stack: this.state.error?.stack || 'No stack trace',
      componentStack: this.state.errorInfo || 'No component stack',
      timestamp: this.state.timestamp || 'No timestamp',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown'
    };
    
    const errorText = JSON.stringify(errorDetails, null, 2);
    
    // In a real app, you would copy to clipboard here
    // For now, we'll show an alert with the error
    Alert.alert(
      'Error Details',
      'Error details logged to console. Check developer tools for full information.',
      [{ text: 'OK' }]
    );
    
    console.log('=== COPYABLE ERROR DETAILS ===');
    console.log(errorText);
    console.log('==============================');
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              <View style={styles.iconContainer}>
                <AlertTriangle size={48} color="#EF4444" />
              </View>
              
              <Text style={styles.title}>App Error Detected</Text>
              
              <Text style={styles.message}>
                The app encountered an unexpected error. This information has been logged for debugging.
              </Text>
              
              {this.state.timestamp && (
                <Text style={styles.timestamp}>
                  Error occurred at: {new Date(this.state.timestamp).toLocaleString()}
                </Text>
              )}
              
              {__DEV__ && this.state.error && (
                <View style={styles.errorSection}>
                  <Text style={styles.errorTitle}>Error Details (Development Mode):</Text>
                  <Text style={styles.errorDetails}>
                    {this.state.error.name}: {this.state.error.message}
                  </Text>
                  
                  {this.state.error.stack && (
                    <ScrollView style={styles.stackContainer} horizontal>
                      <Text style={styles.stackTrace}>
                        {this.state.error.stack}
                      </Text>
                    </ScrollView>
                  )}
                </View>
              )}
              
              <View style={styles.buttonContainer}>
                <TouchableOpacity style={styles.primaryButton} onPress={this.handleReset}>
                  <RefreshCw size={16} color="#FFFFFF" />
                  <Text style={styles.primaryButtonText}>Try Again</Text>
                </TouchableOpacity>
                
                {__DEV__ && (
                  <TouchableOpacity style={styles.secondaryButton} onPress={this.handleCopyError}>
                    <Copy size={16} color="#9CA3AF" />
                    <Text style={styles.secondaryButtonText}>Copy Error Details</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
    justifyContent: 'center',
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 24,
    maxWidth: 300,
  },
  timestamp: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  errorSection: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    width: '100%',
    maxWidth: 400,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F3F4F6',
    marginBottom: 8,
  },
  errorDetails: {
    fontSize: 12,
    color: '#EF4444',
    marginBottom: 12,
    fontFamily: 'monospace',
  },
  stackContainer: {
    maxHeight: 120,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    padding: 8,
  },
  stackTrace: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4B5563',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
  },
});

export default ErrorBoundary;