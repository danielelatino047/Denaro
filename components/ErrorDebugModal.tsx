import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bug, X, Copy, Trash2 } from 'lucide-react-native';
import { globalErrorHandler } from './GlobalErrorHandler';

interface Props {
  visible: boolean;
  onClose: () => void;
}

export default function ErrorDebugModal({ visible, onClose }: Props) {
  const [selectedError, setSelectedError] = useState<any>(null);
  const errorLog = globalErrorHandler.getErrorLog();

  const handleCopyError = (error: any) => {
    const errorDetails = {
      message: error.error.message,
      name: error.error.name,
      stack: error.error.stack,
      isFatal: error.isFatal,
      timestamp: error.timestamp,
      userAgent: error.userAgent,
      url: error.url,
    };
    
    console.log('=== COPIED ERROR DETAILS ===');
    console.log(JSON.stringify(errorDetails, null, 2));
    console.log('============================');
  };

  const handleClearLog = () => {
    globalErrorHandler.clearErrorLog();
    setSelectedError(null);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Bug size={24} color="#EF4444" />
            <Text style={styles.title}>Error Debug Console</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {errorLog.length} errors logged • {errorLog.filter(e => e.isFatal).length} fatal
          </Text>
          {errorLog.length > 0 && (
            <TouchableOpacity onPress={handleClearLog} style={styles.clearButton}>
              <Trash2 size={16} color="#EF4444" />
              <Text style={styles.clearButtonText}>Clear Log</Text>
            </TouchableOpacity>
          )}
        </View>

        {errorLog.length === 0 ? (
          <View style={styles.emptyState}>
            <Bug size={48} color="#6B7280" />
            <Text style={styles.emptyTitle}>No Errors Logged</Text>
            <Text style={styles.emptyDescription}>
              This is good! No JavaScript errors have been detected.
            </Text>
          </View>
        ) : (
          <ScrollView style={styles.errorList}>
            {errorLog.map((errorInfo, index) => (
              <TouchableOpacity
                key={`${errorInfo.timestamp}-${index}`}
                style={[
                  styles.errorItem,
                  errorInfo.isFatal && styles.errorItemFatal,
                  selectedError === errorInfo && styles.errorItemSelected,
                ]}
                onPress={() => setSelectedError(selectedError === errorInfo ? null : errorInfo)}
              >
                <View style={styles.errorHeader}>
                  <Text style={styles.errorName}>
                    {errorInfo.error.name}
                    {errorInfo.isFatal && <Text style={styles.fatalBadge}> FATAL</Text>}
                  </Text>
                  <Text style={styles.errorTime}>
                    {formatTimestamp(errorInfo.timestamp)}
                  </Text>
                </View>
                
                <Text style={styles.errorMessage} numberOfLines={2}>
                  {errorInfo.error.message}
                </Text>

                {selectedError === errorInfo && (
                  <View style={styles.errorDetails}>
                    <ScrollView style={styles.stackContainer} horizontal>
                      <Text style={styles.stackTrace}>
                        {errorInfo.error.stack || 'No stack trace available'}
                      </Text>
                    </ScrollView>
                    
                    <View style={styles.errorActions}>
                      <TouchableOpacity
                        style={styles.copyButton}
                        onPress={() => handleCopyError(errorInfo)}
                      >
                        <Copy size={14} color="#00D4AA" />
                        <Text style={styles.copyButtonText}>Copy Details</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  closeButton: {
    padding: 4,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#374151',
  },
  statsText: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  clearButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  errorList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  errorItem: {
    backgroundColor: '#374151',
    borderRadius: 8,
    padding: 16,
    marginVertical: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
  },
  errorItemFatal: {
    borderLeftColor: '#DC2626',
    backgroundColor: '#450A0A',
  },
  errorItemSelected: {
    backgroundColor: '#1E3A8A',
    borderLeftColor: '#3B82F6',
  },
  errorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  errorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
  },
  fatalBadge: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '700',
  },
  errorTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  errorMessage: {
    fontSize: 14,
    color: '#D1D5DB',
    lineHeight: 20,
  },
  errorDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#4B5563',
  },
  stackContainer: {
    maxHeight: 120,
    backgroundColor: '#1F2937',
    borderRadius: 4,
    padding: 8,
    marginBottom: 12,
  },
  stackTrace: {
    fontSize: 10,
    color: '#9CA3AF',
    fontFamily: 'monospace',
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#1F2937',
  },
  copyButtonText: {
    fontSize: 12,
    color: '#00D4AA',
    fontWeight: '500',
  },
});