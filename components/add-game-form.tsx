import SteamSearch from '@/components/steam-search';
import { StyleSheet, View } from 'react-native';

export default function AddGameForm() {
  return (
    <View style={styles.container}>
      <SteamSearch />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
