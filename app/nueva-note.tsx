import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, SegmentedButtons, Text, TextInput } from 'react-native-paper';

import { FieldError } from '../components/forms/FieldError';
import { radius, spacing } from '../constants/theme';
import { useNoteFlowColors } from '../hooks/useNoteFlowColors';
import {
  checklistFormSchema,
  IDEA_COLOR_OPTIONS,
  ideaFormSchema,
  noteFormSchema,
  zodFieldErrors,
} from '../schemas/noteSchemas';
import { useNotesStore } from '../store/notesStore';
import { createId } from '../utils/id';

type ContentType = 'note' | 'checklist' | 'idea';

function parseInitialType(value: string | string[] | undefined): ContentType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'checklist' || raw === 'idea') return raw;
  return 'note';
}

export default function NuevaNoteScreen() {
  const colors = useNoteFlowColors();
  const params = useLocalSearchParams<{ type?: string }>();
  const addNote = useNotesStore((s) => s.addNote);
  const addChecklist = useNotesStore((s) => s.addChecklist);
  const addIdea = useNotesStore((s) => s.addIdea);

  const [contentType, setContentType] = useState<ContentType>(() =>
    parseInitialType(params.type)
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [itemTexts, setItemTexts] = useState<string[]>(['']);
  const [tagsInput, setTagsInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(IDEA_COLOR_OPTIONS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function handleClose() {
    router.back();
  }

  function handleSave() {
    setErrors({});
    const now = new Date();

    if (contentType === 'note') {
      const result = noteFormSchema.safeParse({ title, content });
      if (!result.success) {
        setErrors(zodFieldErrors(result.error));
        return;
      }
      addNote({
        id: createId('note'),
        title: result.data.title,
        content: result.data.content,
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      });
      handleClose();
      return;
    }

    if (contentType === 'checklist') {
      const items = itemTexts
        .map((text) => ({ text: text.trim() }))
        .filter((i) => i.text.length > 0);
      const result = checklistFormSchema.safeParse({ title, items });
      if (!result.success) {
        setErrors(zodFieldErrors(result.error));
        return;
      }
      addChecklist({
        id: createId('checklist'),
        title: result.data.title,
        items: result.data.items.map((item) => ({
          id: createId('item'),
          text: item.text,
          isCompleted: false,
        })),
        createdAt: now,
        updatedAt: now,
        isArchived: false,
      });
      handleClose();
      return;
    }

    const result = ideaFormSchema.safeParse({
      title,
      tagsInput,
      color: selectedColor,
    });
    if (!result.success) {
      setErrors(zodFieldErrors(result.error));
      return;
    }
    const tags = result.data.tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);
    addIdea({
      id: createId('idea'),
      title: result.data.title,
      tags,
      color: result.data.color,
      createdAt: now,
      updatedAt: now,
      isArchived: false,
    });
    handleClose();
  }

  function updateItemText(index: number, value: string) {
    setItemTexts((prev) => prev.map((t, i) => (i === index ? value : t)));
  }

  function addItemRow() {
    setItemTexts((prev) => [...prev, '']);
  }

  function removeItemRow(index: number) {
    setItemTexts((prev) => (prev.length <= 1 ? prev : prev.filter((_, i) => i !== index)));
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Nuevo contenido',
          headerLeft: () => (
            <Button mode="text" onPress={handleClose} compact>
              Cancelar
            </Button>
          ),
        }}
      />
      <KeyboardAvoidingView
        style={[styles.flex, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <SegmentedButtons
            value={contentType}
            onValueChange={(v) => setContentType(v as ContentType)}
            buttons={[
              { value: 'note', label: 'Nota' },
              { value: 'checklist', label: 'Checklist' },
              { value: 'idea', label: 'Idea' },
            ]}
            style={styles.segmented}
          />

          <TextInput
            mode="outlined"
            label="Título"
            value={title}
            onChangeText={setTitle}
            style={styles.field}
            outlineColor={colors.border}
            activeOutlineColor={colors.textPrimary}
            textColor={colors.textPrimary}
          />
          <FieldError message={errors.title} />

          {contentType === 'note' && (
            <>
              <TextInput
                mode="outlined"
                label="Contenido"
                value={content}
                onChangeText={setContent}
                multiline
                numberOfLines={5}
                style={styles.field}
                outlineColor={colors.border}
                activeOutlineColor={colors.textPrimary}
                textColor={colors.textPrimary}
              />
              <FieldError message={errors.content} />
            </>
          )}

          {contentType === 'checklist' && (
            <View style={styles.checklistBlock}>
              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                Ítems
              </Text>
              {itemTexts.map((itemText, index) => (
                <View key={`item-row-${index}`} style={styles.itemRow}>
                  <TextInput
                    mode="outlined"
                    label={`Ítem ${index + 1}`}
                    value={itemText}
                    onChangeText={(v) => updateItemText(index, v)}
                    style={styles.itemInput}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.textPrimary}
                    textColor={colors.textPrimary}
                  />
                  {itemTexts.length > 1 ? (
                    <Button
                      mode="text"
                      compact
                      onPress={() => removeItemRow(index)}
                      textColor={colors.textTertiary}
                    >
                      Quitar
                    </Button>
                  ) : null}
                </View>
              ))}
              <FieldError message={errors.items} />
              <Button mode="outlined" onPress={addItemRow} style={styles.addItemBtn}>
                + Añadir ítem
              </Button>
            </View>
          )}

          {contentType === 'idea' && (
            <>
              <TextInput
                mode="outlined"
                label="Etiquetas (separadas por coma)"
                value={tagsInput}
                onChangeText={setTagsInput}
                placeholder="producto, v2"
                style={styles.field}
                outlineColor={colors.border}
                activeOutlineColor={colors.textPrimary}
                textColor={colors.textPrimary}
              />
              <FieldError message={errors.tagsInput} />

              <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                Color
              </Text>
              <View style={styles.colorRow}>
                {IDEA_COLOR_OPTIONS.map((color) => (
                  <Pressable
                    key={color}
                    onPress={() => setSelectedColor(color)}
                    style={[
                      styles.colorSwatch,
                      {
                        backgroundColor: color,
                        borderColor:
                          selectedColor === color
                            ? colors.textPrimary
                            : colors.borderStrong,
                        borderWidth: selectedColor === color ? 2 : 1,
                      },
                    ]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: selectedColor === color }}
                  />
                ))}
              </View>
              <FieldError message={errors.color} />
            </>
          )}

          <View style={styles.actions}>
            <Button mode="outlined" onPress={handleClose} textColor={colors.textPrimary}>
              Cerrar
            </Button>
            <Button mode="contained" onPress={handleSave} buttonColor={colors.fill}>
              Guardar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.sm,
  },
  segmented: { marginBottom: spacing.md },
  field: { marginTop: spacing.xs },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  checklistBlock: { gap: spacing.sm },
  itemRow: { gap: spacing.xxs },
  itemInput: { flex: 1 },
  addItemBtn: { alignSelf: 'flex-start', marginTop: spacing.xs },
  colorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.xs,
  },
  colorSwatch: {
    width: 40,
    height: 40,
    borderRadius: radius.button,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
