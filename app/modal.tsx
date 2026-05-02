import { Link } from 'expo-router';
import { StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ModalScreen() {
  const colorScheme = useColorScheme() ?? 'light'
  const theme = Colors[colorScheme]

  return (
    <ThemedView style={[styles.container, { backgroundColor: theme.background }]}>
      <ThemedView style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ThemedText type="title" style={{ color: theme.text, textAlign: 'center' }}>Quick actions</ThemedText>
        <ThemedText style={{ color: theme.mutedText, textAlign: 'center', marginTop: 12, lineHeight: 22 }}>
          This modal can later hold filters, sorting or a short help view.
        </ThemedText>
        <Link href="/" dismissTo style={styles.link}>
          <ThemedText type="link">Go to home screen</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
    alignSelf: 'center',
  },
});
