/**
 * Avatar remoto con placeholder y soporte de caché para mejorar UX.
 */
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Image, Platform, StyleSheet, View } from 'react-native';

import { radius } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';

type RemoteAvatarProps = {
  uri: string;
  size?: number;
};

export function RemoteAvatar({ uri, size = 46 }: RemoteAvatarProps) {
  const colors = useNoteFlowColors();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
  }, [uri]);

  const source = useMemo(
    () =>
      Platform.OS === 'ios'
        ? ({ uri, cache: 'force-cache' } as const)
        : ({ uri } as const),
    [uri]
  );

  if (hasError) {
    return (
      <View
        style={[
          styles.fallback,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: colors.surfaceMuted,
          },
        ]}
      >
        <MaterialCommunityIcons
          name="account-circle-outline"
          size={Math.round(size * 0.55)}
          color={colors.textSecondary}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.wrapper,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: colors.surfaceMuted,
        },
      ]}
    >
      <Image
        source={source}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setHasError(true);
          setIsLoading(false);
        }}
      />
      {isLoading ? (
        <View style={styles.placeholder} pointerEvents="none">
          <ActivityIndicator size="small" color={colors.textTertiary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.button,
  },
});
