/**
 * Pantalla modal para crear contenido nuevo (nota, checklist o idea).
 * Valida con Zod antes de persistir en Zustand; acepta `?type=` para abrir
 * directamente el segmento correspondiente desde cada pestaña.
 */
import DateTimePicker from '@react-native-community/datetimepicker';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import { Button, SegmentedButtons, Switch, Text, TextInput } from 'react-native-paper';

import { formatNoteCardDate } from '../utils/formatDate';
import { getCurrentAddress, type NoteLocation } from '../utils/location';
import { scheduleReminder } from '../utils/notifications';

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

type ContentType = 'note' | 'checklist' | 'idea';

// Normaliza el query param `type` de Expo Router (puede llegar como string o array).
function parseInitialType(value: string | string[] | undefined): ContentType {
  const raw = Array.isArray(value) ? value[0] : value;
  if (raw === 'checklist' || raw === 'idea') return raw;
  return 'note';
}

/** Por defecto: recordatorio una hora después de abrir el formulario. */
function defaultReminderDate(): Date {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 60);
  return date;
}

export default function NuevaNoteScreen() {
  const colors = useNoteFlowColors();
  const params = useLocalSearchParams<{ type?: string }>();
  const addNote = useNotesStore((s) => s.addNote);
  const addChecklist = useNotesStore((s) => s.addChecklist);
  const addIdea = useNotesStore((s) => s.addIdea);
  const saveError = useNotesStore((s) => s.error);
  const clearNotesError = useNotesStore((s) => s.clearError);

  const [contentType, setContentType] = useState<ContentType>(() =>
    parseInitialType(params.type)
  );
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [itemTexts, setItemTexts] = useState<string[]>(['']);
  const [tagsInput, setTagsInput] = useState('');
  const [selectedColor, setSelectedColor] = useState<string>(IDEA_COLOR_OPTIONS[0]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [reminderDate, setReminderDate] = useState(defaultReminderDate);
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  const [noteLocation, setNoteLocation] = useState<NoteLocation | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  function handleClose() {
    if (isSaving) return;
    router.back();
  }

  async function handleAttachLocation() {
    if (isSaving || isFetchingLocation) return;
    setIsFetchingLocation(true);
    setErrors((prev) => {
      const next = { ...prev };
      delete next.location;
      return next;
    });
    try {
      const location = await getCurrentAddress();
      if (location) {
        setNoteLocation(location);
      }
    } finally {
      setIsFetchingLocation(false);
    }
  }

  // Valida según el tipo activo, crea el ítem vía API y cierra el modal.
  async function handleSave() {
    if (isSaving) return;
    setErrors({});
    clearNotesError();

    if (contentType === 'note') {
      const result = noteFormSchema.safeParse({ title, content });
      if (!result.success) {
        setErrors(zodFieldErrors(result.error));
        return;
      }
      if (reminderEnabled && reminderDate.getTime() <= Date.now()) {
        setErrors({ reminder: 'El recordatorio debe ser en el futuro' });
        return;
      }
      setIsSaving(true);
      try {
        const ok = await addNote(result.data, noteLocation);
        if (!ok) return;

        if (reminderEnabled) {
          const notificationId = await scheduleReminder(result.data.title, reminderDate);
          if (!notificationId) {
            Alert.alert(
              'Recordatorio no programado',
              'Revisa permisos de notificaciones en Ajustes y que la fecha sea futura.'
            );
          }
        }

        handleClose();
      } finally {
        setIsSaving(false);
      }
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
      setIsSaving(true);
      try {
        const ok = await addChecklist(result.data);
        if (ok) handleClose();
      } finally {
        setIsSaving(false);
      }
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
    setIsSaving(true);
    try {
      const ok = await addIdea({ ...result.data, tags });
      if (ok) handleClose();
    } finally {
      setIsSaving(false);
    }
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
            <Button mode="text" onPress={handleClose} compact disabled={isSaving}>
              Cancelar
            </Button>
          ),
        }}
      />
      {/* Evita que el teclado tape campos en iOS/Android al escribir título o ítems */}
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
            disabled={isSaving}
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

              <View style={styles.locationBlock}>
                <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                  Ubicación (opcional)
                </Text>
                <Button
                  mode="outlined"
                  onPress={() => void handleAttachLocation()}
                  loading={isFetchingLocation}
                  disabled={isSaving || isFetchingLocation}
                  textColor={colors.textPrimary}
                >
                  Usar mi ubicación
                </Button>
                {noteLocation ? (
                  <Text style={[styles.locationPreview, { color: colors.textSecondary }]}>
                    {noteLocation.name}
                  </Text>
                ) : null}
                {noteLocation ? (
                  <Button
                    mode="text"
                    compact
                    onPress={() => setNoteLocation(null)}
                    disabled={isSaving}
                    textColor={colors.textTertiary}
                  >
                    Quitar ubicación
                  </Button>
                ) : null}
                <FieldError message={errors.location} />
              </View>

              <View style={styles.reminderBlock}>
                <View style={styles.reminderHeader}>
                  <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>
                    Recordatorio local
                  </Text>
                  <Switch
                    value={reminderEnabled}
                    onValueChange={setReminderEnabled}
                    disabled={isSaving}
                  />
                </View>
                {reminderEnabled ? (
                  <>
                    {Platform.OS === 'android' ? (
                      <>
                        <Button
                          mode="outlined"
                          onPress={() => setShowAndroidDatePicker(true)}
                          disabled={isSaving}
                          textColor={colors.textPrimary}
                        >
                          {formatNoteCardDate(reminderDate)}
                        </Button>
                        {showAndroidDatePicker ? (
                          <DateTimePicker
                            value={reminderDate}
                            mode="datetime"
                            minimumDate={new Date()}
                            onChange={(_event, date) => {
                              setShowAndroidDatePicker(false);
                              if (date) setReminderDate(date);
                            }}
                          />
                        ) : null}
                      </>
                    ) : (
                      <DateTimePicker
                        value={reminderDate}
                        mode="datetime"
                        minimumDate={new Date()}
                        onChange={(_event, date) => {
                          if (date) setReminderDate(date);
                        }}
                        style={styles.datePicker}
                      />
                    )}
                    <FieldError message={errors.reminder} />
                  </>
                ) : null}
              </View>
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
            {saveError ? <FieldError message={saveError} /> : null}
            <Button
              mode="outlined"
              onPress={handleClose}
              textColor={colors.textPrimary}
              disabled={isSaving}
            >
              Cerrar
            </Button>
            <Button
              mode="contained"
              onPress={handleSave}
              buttonColor={colors.fill}
              loading={isSaving}
              disabled={isSaving}
            >
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
  locationBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  locationPreview: {
    fontSize: 14,
    lineHeight: 20,
  },
  reminderBlock: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  datePicker: {
    alignSelf: 'flex-start',
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
  },
});
