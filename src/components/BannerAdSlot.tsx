import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

/**
 * Reklam alanı. `react-native-google-mobile-ads` Expo Go'da çalışmaz;
 * gerçek reklamları görmek için `expo run:android` / `expo run:ios` ile
 * ya da bir EAS development build ile çalıştırman gerekir. Modül
 * bulunamazsa (örn. Expo Go) sessizce bir boşluk gösterir, uygulamayı
 * çökertmez.
 */
export function BannerAdSlot() {
  const [AdComponents, setAdComponents] = useState<null | {
    BannerAd: any;
    BannerAdSize: any;
    TestIds: any;
  }>(null);

  useEffect(() => {
    try {
      // Statik analiz yerine çalışma zamanında yükle: modül native
      // build'de yoksa (Expo Go) hata fırlatır, biz de yakalarız.
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const mod = require('react-native-google-mobile-ads');
      setAdComponents({ BannerAd: mod.BannerAd, BannerAdSize: mod.BannerAdSize, TestIds: mod.TestIds });
    } catch {
      setAdComponents(null);
    }
  }, []);

  if (!AdComponents) {
    return (
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>Reklam alanı</Text>
      </View>
    );
  }

  const { BannerAd, BannerAdSize, TestIds } = AdComponents;
  return (
    <View style={styles.wrapper}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : 'ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY'}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', marginVertical: 8 },
  placeholder: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placeholderText: { color: colors.textMuted, fontSize: 12 },
});
