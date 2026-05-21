import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { StyleSheet, Text, View } from 'react-native';

import { spacing } from '../../constants/theme';
import { useNoteFlowColors } from '../../hooks/useNoteFlowColors';
import type { IdeaNote } from '../../types';
import { truncate } from '../../utils/text';
import { CardShell } from './CardShell';

type IdeaCardProps = {
  idea: IdeaNote;
  preview?: string;
  onPress?: () => void;
};

function ideaCardBackground(base: string, ideaColor: string): string {
  if (!ideaColor?.startsWith('#') || ideaColor.length < 7) return base;
  return ideaColor;
}

export function IdeaCard({ idea, preview, onPress }: IdeaCardProps) {
  const colors = useNoteFlowColors();
  const cardBackground = ideaCardBackground(colors.surfaceMuted, idea.color);

  return (
    <CardShell
      label="IDEA"
      leftAccessory={
        <MaterialCommunityIcons
          name="lightbulb-outline"
          size={20}
          color={colors.textTertiary}
        />
      }
      title={idea.title}
      onPress={onPress}
      style={{ backgroundColor: cardBackground }}
      footer={
        <View style={styles.footerRow}>
          <View style={styles.tags}>
            {idea.tags.length === 0 ? (
              <Text style={[styles.emptyTags, { color: colors.textTertiary }]}>
                Sin etiquetas
              </Text>
            ) : (
              idea.tags.slice(0, 3).map((tag) => (
                <View
                  key={tag}
                  style={[
                    styles.tag,
                    {
                      borderColor: colors.cardBorder,
                      backgroundColor: colors.surface,
                    },
                  ]}
                >
                  <Text style={[styles.tagText, { color: colors.textSecondary }]}>
                    {tag.toUpperCase()}
                  </Text>
                </View>
              ))
            )}
          </View>
          <MaterialCommunityIcons
            name="chevron-right"
            size={22}
            color={colors.textDisabled}
          />
        </View>
      }
    >
      {preview ? (
        <Text style={[styles.preview, { color: colors.textSecondary }]} numberOfLines={1}>
          {truncate(preview, 64)}
        </Text>
      ) : null}
    </CardShell>
  );
}

const styles = StyleSheet.create({
  preview: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: spacing.xxs,
  },
  footerRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  tags: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  tag: {
    borderWidth: 1.5,
    borderRadius: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  emptyTags: {
    fontSize: 12,
  },
});
