import type { User } from '@supabase/supabase-js';
import { CVAdditionalSection, CVData, CVDesign, CVTemplate, Language, emptyCVData } from '@/types/cv';
import { createSupabaseClient, hasSupabaseConfig, tryCreateSupabaseClient } from '@/utils/supabase/client';

const templateIds = new Set<CVTemplate>([
  'modern',
  'classic',
  'creative',
  'minimal',
  'executive',
  'mono',
  'atlas',
  'studio',
  'compact',
  'grid',
  'dev',
]);

export type ApplicationStage = 'Saved' | 'Applied' | 'No response' | 'Interview' | 'Offer' | 'Closed';

export type CvTemplateRecord = {
  id: CVTemplate;
  label: string;
  description: string;
  category: string;
  isDeveloperFocused: boolean;
  sortOrder: number;
};

export type SavedCv = {
  id: string;
  name: string;
  templateId: CVTemplate;
  format: string;
  pages: string;
  strength: number;
  updated: string;
  data: CVData;
};

export type SubscriptionState = {
  isActive: boolean;
  status: string | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
};

export type BillingPlanId = 'weekly' | 'monthly' | 'yearly';

export type DbApplication = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  score: string;
  stage: ApplicationStage;
  when: string;
  reason?: string;
  sourceUrl?: string;
  followUpAt?: string;
  notes?: string;
  isDemo?: boolean;
};

type CvRow = {
  id: string;
  name: string | null;
  template_id: string | null;
  pages: string | null;
  strength: number | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  title: string | null;
  summary: string | null;
  website: string | null;
  linkedin: string | null;
  photo_url: string | null;
  design: CVDesign | null;
  custom_sections?: CVAdditionalSection[] | null;
  updated_at: string | null;
  cv_experiences?: Array<{
    id: string;
    company: string | null;
    position: string | null;
    start_date: string | null;
    end_date: string | null;
    current: boolean | null;
    description: string | null;
    sort_order: number | null;
  }>;
  cv_education?: Array<{
    id: string;
    institution: string | null;
    degree: string | null;
    field: string | null;
    start_date: string | null;
    end_date: string | null;
    grade: string | null;
    description: string | null;
    sort_order: number | null;
  }>;
  cv_skills?: Array<{
    id: string;
    name: string | null;
    level: number | null;
    sort_order: number | null;
  }>;
  cv_languages?: Array<{
    id: string;
    name: string | null;
    level: Language['level'] | null;
    sort_order: number | null;
  }>;
};

type ApplicationRow = {
  id: string;
  title: string | null;
  company: string | null;
  location: string | null;
  salary: string | null;
  score: string | null;
  stage: ApplicationStage | null;
  source_url: string | null;
  follow_up_at?: string | null;
  notes?: string | null;
  is_demo: boolean | null;
  updated_at?: string | null;
  created_at?: string | null;
};

const ensureSupabase = () => createSupabaseClient();

const getErrorField = (error: unknown, key: string) => {
  if (!error || typeof error !== 'object' || !(key in error)) return '';
  const value = (error as Record<string, unknown>)[key];
  return typeof value === 'string' ? value : '';
};

const toError = (message: string, error: unknown) => {
  const code = getErrorField(error, 'code');
  const constraintMessage = getErrorField(error, 'message');
  const migrationHint =
    code === '23514' && constraintMessage.includes('applications_stage_check')
      ? 'Run supabase-application-status-migration.sql so the database accepts the current application stages.'
      : '';
  const detail = [
    error instanceof Error ? error.message : getErrorField(error, 'message'),
    getErrorField(error, 'details'),
    getErrorField(error, 'hint'),
    migrationHint,
    code,
  ]
    .filter(Boolean)
    .join(' · ');

  if (detail) return new Error(`${message}: ${detail}`);
  if (error && typeof error === 'object') return new Error(`${message}: ${JSON.stringify(error)}`);
  return new Error(`${message}: ${String(error)}`);
};

const getApiErrorMessage = (data: unknown, fallback: string) => {
  if (data && typeof data === 'object' && 'error' in data) {
    const error = (data as { error?: unknown }).error;
    if (typeof error === 'string' && error.trim()) return error;
  }

  return fallback;
};

const readApiJson = async <T>(response: Response, fallbackError: string): Promise<T> => {
  const text = await response.text();
  let data: unknown = null;

  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      const message = text.trim();
      throw new Error(response.ok ? 'Server returned invalid JSON.' : message || fallbackError);
    }
  }

  if (!response.ok) throw new Error(getApiErrorMessage(data, fallbackError));
  return data as T;
};

const normalizeTemplateId = (value?: string | null): CVTemplate =>
  value && templateIds.has(value as CVTemplate) ? (value as CVTemplate) : 'modern';

const sortByOrder = <T extends { sort_order?: number | null }>(rows: T[] = []) =>
  [...rows].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

const formatRelativeDate = (value?: string | null) => {
  if (!value) return 'today';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'today';

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays <= 0) return 'today';
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 35) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

const mapCvRow = (row: CvRow, templates: CvTemplateRecord[]): SavedCv => {
  const templateId = normalizeTemplateId(row.template_id);
  const template = templates.find((item) => item.id === templateId);

  return {
    id: row.id,
    name: row.name || 'Untitled CV',
    templateId,
    format: template?.label || templateId,
    pages: row.pages || '1 page',
    strength: row.strength ?? 0,
    updated: formatRelativeDate(row.updated_at),
    data: {
      personalInfo: {
        firstName: row.first_name || '',
        lastName: row.last_name || '',
        email: row.email || '',
        phone: row.phone || '',
        address: row.address || '',
        title: row.title || '',
        summary: row.summary || '',
        website: row.website || '',
        linkedin: row.linkedin || '',
        photo: row.photo_url || undefined,
      },
      experiences: sortByOrder(row.cv_experiences).map((item) => ({
        id: item.id,
        company: item.company || '',
        position: item.position || '',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        current: Boolean(item.current),
        description: item.description || '',
      })),
      education: sortByOrder(row.cv_education).map((item) => ({
        id: item.id,
        institution: item.institution || '',
        degree: item.degree || '',
        field: item.field || '',
        startDate: item.start_date || '',
        endDate: item.end_date || '',
        grade: item.grade || '',
        description: item.description || '',
      })),
      skills: sortByOrder(row.cv_skills).map((item) => ({
        id: item.id,
        name: item.name || '',
        level: item.level || 3,
      })),
      languages: sortByOrder(row.cv_languages).map((item) => ({
        id: item.id,
        name: item.name || '',
        level: item.level || 'B2',
      })),
      additionalSections: Array.isArray(row.custom_sections) ? row.custom_sections : [],
      design: row.design || emptyCVData.design,
    },
  };
};

const mapApplicationRow = (row: ApplicationRow): DbApplication => ({
  id: row.id,
  title: row.title || '',
  company: row.company || '',
  location: row.location || '',
  salary: row.salary || '',
  score: row.score || '',
  stage: row.stage || 'Saved',
  when: formatRelativeDate(row.updated_at || row.created_at),
  sourceUrl: row.source_url || undefined,
  followUpAt: row.follow_up_at || undefined,
  notes: row.notes || undefined,
  isDemo: Boolean(row.is_demo),
});

export const supabaseConfigured = hasSupabaseConfig;

export const getInitialAuthUser = async () => {
  const supabase = tryCreateSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user;
};

export const onAuthUserChange = (callback: (user: User | null) => void) => {
  const supabase = tryCreateSupabaseClient();
  if (!supabase) return () => undefined;

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(session?.user ?? null);
  });

  return () => data.subscription.unsubscribe();
};

export const signInWithEmail = async (email: string) => {
  const supabase = ensureSupabase();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) throw toError('Login konnte nicht gestartet werden', error);
};

export const signOut = async () => {
  const supabase = ensureSupabase();
  const { error } = await supabase.auth.signOut();
  if (error) throw toError('Logout fehlgeschlagen', error);
};

export const getCurrentAccessToken = async () => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase.auth.getSession();
  if (error) throw toError('Session konnte nicht gelesen werden', error);
  return data.session?.access_token || '';
};

export const fetchSubscriptionStatus = async (): Promise<SubscriptionState> => {
  const token = await getCurrentAccessToken();
  if (!token) {
    return {
      isActive: false,
      status: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      stripeCustomerId: null,
    };
  }

  const response = await fetch('/api/stripe-subscription-status', {
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const data = await readApiJson<SubscriptionState>(response, 'Subscription konnte nicht geladen werden.');
  return data as SubscriptionState;
};

export const createCheckoutSession = async (planId: BillingPlanId = 'monthly') => {
  const token = await getCurrentAccessToken().catch(() => '');
  const headers: Record<string, string> = {
    'content-type': 'application/json',
  };
  if (token) headers.authorization = `Bearer ${token}`;

  const response = await fetch('/api/stripe-checkout', {
    method: 'POST',
    headers,
    body: JSON.stringify({ planId }),
  });

  const data = await readApiJson<{ url?: unknown }>(response, 'Checkout konnte nicht gestartet werden.');
  if (!data?.url || typeof data.url !== 'string') throw new Error('Checkout URL fehlt.');
  return data.url as string;
};

export const createBillingPortalSession = async () => {
  const token = await getCurrentAccessToken();
  if (!token) throw new Error('Login required.');

  const response = await fetch('/api/stripe-portal', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
    },
  });

  const data = await readApiJson<{ url?: unknown }>(response, 'Billing Portal konnte nicht gestartet werden.');
  if (!data?.url || typeof data.url !== 'string') throw new Error('Billing Portal URL fehlt.');
  return data.url as string;
};

export const ensureProfile = async (user: User) => {
  const supabase = ensureSupabase();
  const displayName =
    typeof user.user_metadata?.full_name === 'string'
      ? user.user_metadata.full_name
      : user.email?.split('@')[0] || 'User';

  const { error } = await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email,
      display_name: displayName,
    },
    { onConflict: 'id' },
  );

  if (error) throw toError('Profil konnte nicht gespeichert werden', error);
};

export const fetchTemplates = async (): Promise<CvTemplateRecord[]> => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('cv_templates')
    .select('id,label,description,category,is_developer_focused,sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) throw toError('Templates konnten nicht geladen werden', error);

  return (data || []).map((item) => ({
    id: normalizeTemplateId(item.id),
    label: item.label,
    description: item.description,
    category: item.category,
    isDeveloperFocused: Boolean(item.is_developer_focused),
    sortOrder: item.sort_order ?? 0,
  }));
};

export const fetchDashboardData = async (user: User) => {
  await ensureProfile(user);
  const supabase = ensureSupabase();

  const [templates, cvsResult, applicationsResult, settingsResult] = await Promise.all([
    fetchTemplates(),
    supabase
      .from('cvs')
      .select(
        '*,cv_experiences(*),cv_education(*),cv_skills(*),cv_languages(*)',
      )
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('applications')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false }),
    supabase
      .from('dashboard_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle(),
  ]);

  if (cvsResult.error) throw toError('CVs konnten nicht geladen werden', cvsResult.error);
  if (applicationsResult.error) throw toError('Bewerbungen konnten nicht geladen werden', applicationsResult.error);
  if (settingsResult.error) throw toError('Dashboard-Settings konnten nicht geladen werden', settingsResult.error);

  if (!settingsResult.data) {
    const { error } = await supabase.from('dashboard_settings').insert({
      user_id: user.id,
      default_template_id: 'modern',
      default_dashboard_route: '/dashboard/simulator',
      locked_message: null,
    });

    if (error) throw toError('Dashboard-Settings konnten nicht erstellt werden', error);
  }

  return {
    templates,
    cvs: ((cvsResult.data || []) as CvRow[]).map((row) => mapCvRow(row, templates)),
    applications: ((applicationsResult.data || []) as ApplicationRow[]).map(mapApplicationRow),
  };
};

export const saveCvSnapshot = async ({
  userId,
  cvId,
  name,
  templateId,
  data,
}: {
  userId: string;
  cvId?: string | null;
  name: string;
  templateId: CVTemplate;
  data: CVData;
}) => {
  const supabase = ensureSupabase();
  const isNewCv = !cvId;
  const payload = {
    user_id: userId,
    name,
    template_id: templateId,
    pages: '1 page',
    strength: Math.min(
      100,
      [
        data.personalInfo.firstName,
        data.personalInfo.lastName,
        data.personalInfo.email,
        data.personalInfo.title,
        data.personalInfo.summary,
        data.experiences.length ? 'experience' : '',
        data.skills.length ? 'skills' : '',
        (data.additionalSections || []).length ? 'additional' : '',
      ].filter(Boolean).length * 14,
    ),
    first_name: data.personalInfo.firstName,
    last_name: data.personalInfo.lastName,
    email: data.personalInfo.email,
    phone: data.personalInfo.phone,
    address: data.personalInfo.address,
    title: data.personalInfo.title,
    summary: data.personalInfo.summary,
    website: data.personalInfo.website || null,
    linkedin: data.personalInfo.linkedin || null,
    photo_url: data.personalInfo.photo || null,
    custom_sections: data.additionalSections || [],
    design: data.design,
  };

  const writeCv = (cvPayload: Record<string, unknown>) =>
    cvId
      ? supabase.from('cvs').update(cvPayload).eq('id', cvId).eq('user_id', userId).select('id').single()
      : supabase.from('cvs').insert(cvPayload).select('id').single();

  let cvResult = await writeCv(payload);
  const missingCustomSections =
    cvResult.error &&
    [getErrorField(cvResult.error, 'message'), getErrorField(cvResult.error, 'details'), getErrorField(cvResult.error, 'hint')]
      .join(' ')
      .includes('custom_sections');

  if (missingCustomSections) {
    const payloadWithoutCustomSections: Record<string, unknown> = { ...payload };
    delete payloadWithoutCustomSections.custom_sections;
    cvResult = await writeCv(payloadWithoutCustomSections);
  }

  if (cvResult.error) throw toError('CV konnte nicht gespeichert werden', cvResult.error);

  const savedCvId = cvResult.data.id as string;
  const deleteResults = await Promise.all([
    supabase.from('cv_experiences').delete().eq('cv_id', savedCvId),
    supabase.from('cv_education').delete().eq('cv_id', savedCvId),
    supabase.from('cv_skills').delete().eq('cv_id', savedCvId),
    supabase.from('cv_languages').delete().eq('cv_id', savedCvId),
  ]);

  for (const result of deleteResults) {
    if (result.error) throw toError('CV-Abschnitte konnten nicht aktualisiert werden', result.error);
  }

  const inserts = [];
  if (data.experiences.length) {
    inserts.push(
      supabase.from('cv_experiences').insert(
        data.experiences.map((item, index) => ({
          id: isNewCv ? crypto.randomUUID() : item.id,
          cv_id: savedCvId,
          company: item.company,
          position: item.position,
          start_date: item.startDate,
          end_date: item.endDate,
          current: item.current,
          description: item.description,
          sort_order: index,
        })),
      ),
    );
  }

  if (data.education.length) {
    inserts.push(
      supabase.from('cv_education').insert(
        data.education.map((item, index) => ({
          id: isNewCv ? crypto.randomUUID() : item.id,
          cv_id: savedCvId,
          institution: item.institution,
          degree: item.degree,
          field: item.field,
          start_date: item.startDate,
          end_date: item.endDate,
          grade: item.grade || null,
          description: item.description || null,
          sort_order: index,
        })),
      ),
    );
  }

  if (data.skills.length) {
    inserts.push(
      supabase.from('cv_skills').insert(
        data.skills.map((item, index) => ({
          id: isNewCv ? crypto.randomUUID() : item.id,
          cv_id: savedCvId,
          name: item.name,
          level: item.level,
          sort_order: index,
        })),
      ),
    );
  }

  if (data.languages.length) {
    inserts.push(
      supabase.from('cv_languages').insert(
        data.languages.map((item, index) => ({
          id: isNewCv ? crypto.randomUUID() : item.id,
          cv_id: savedCvId,
          name: item.name,
          level: item.level,
          sort_order: index,
        })),
      ),
    );
  }

  const insertResults = await Promise.all(inserts);
  for (const result of insertResults) {
    if (result.error) throw toError('CV-Abschnitte konnten nicht gespeichert werden', result.error);
  }

  return savedCvId;
};

export const saveApplication = async ({
  userId,
  cvId,
  application,
}: {
  userId: string;
  cvId?: string | null;
  application: DbApplication;
}) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('applications')
    .insert({
      user_id: userId,
      cv_id: cvId || null,
      title: application.title,
      company: application.company,
      location: application.location,
      salary: application.salary,
      score: application.score,
      stage: application.stage,
      source_url: application.sourceUrl || null,
      follow_up_at: application.followUpAt || null,
      notes: application.notes || null,
      is_demo: false,
    })
    .select('*')
    .single();

  if (error) throw toError('Bewerbung konnte nicht gespeichert werden', error);
  return mapApplicationRow(data as ApplicationRow);
};

export const deleteSavedCv = async ({ userId, cvId }: { userId: string; cvId: string }) => {
  const supabase = ensureSupabase();

  const unlinkApplications = await supabase
    .from('applications')
    .update({ cv_id: null })
    .eq('user_id', userId)
    .eq('cv_id', cvId);
  if (unlinkApplications.error) throw toError('CV-Verknüpfungen konnten nicht gelöst werden', unlinkApplications.error);

  const deleteResults = await Promise.all([
    supabase.from('cv_experiences').delete().eq('cv_id', cvId),
    supabase.from('cv_education').delete().eq('cv_id', cvId),
    supabase.from('cv_skills').delete().eq('cv_id', cvId),
    supabase.from('cv_languages').delete().eq('cv_id', cvId),
  ]);

  for (const result of deleteResults) {
    if (result.error) throw toError('CV-Abschnitte konnten nicht gelöscht werden', result.error);
  }

  const { error } = await supabase
    .from('cvs')
    .delete()
    .eq('id', cvId)
    .eq('user_id', userId);

  if (error) throw toError('CV konnte nicht gelöscht werden', error);
  return cvId;
};

export const updateApplicationStage = async (applicationId: string, stage: ApplicationStage) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('applications')
    .update({ stage })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) throw toError('Bewerbungsstatus konnte nicht gespeichert werden', error);
  return mapApplicationRow(data as ApplicationRow);
};

export const updateApplicationFollowUp = async (applicationId: string, followUpAt: string | null) => {
  const supabase = ensureSupabase();
  const { data, error } = await supabase
    .from('applications')
    .update({ follow_up_at: followUpAt })
    .eq('id', applicationId)
    .select('*')
    .single();

  if (error) throw toError('Follow-up konnte nicht gespeichert werden', error);
  return mapApplicationRow(data as ApplicationRow);
};
