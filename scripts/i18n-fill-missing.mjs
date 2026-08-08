/**
 * Merge missing i18n keys into ar.json / en.json.
 * Run: node scripts/i18n-fill-missing.mjs
 */
import fs from "fs";

const arPath = "src/i18n/locales/ar.json";
const enPath = "src/i18n/locales/en.json";

function setPath(obj, dotted, value) {
  const parts = dotted.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (!cur[p] || typeof cur[p] !== "object") cur[p] = {};
    cur = cur[p];
  }
  const leaf = parts[parts.length - 1];
  if (cur[leaf] === undefined) cur[leaf] = value;
}

const pairs = {
  "common.actions": ["Actions", "الإجراءات"],
  "common.cancel": ["Cancel", "إلغاء"],
  "common.remove": ["Remove", "إزالة"],
  "common.previous": ["Previous", "السابق"],
  "settings.errors.passwordFailed": ["Could not update password.", "تعذّر تحديث كلمة المرور."],
  "settings.errors.saveFailed": ["Could not save profile.", "تعذّر حفظ الملف الشخصي."],

  "adminPages.addCourse.courseType": ["Course type", "نوع الكورس"],
  "adminPages.addCourse.lifetimePurchasable": ["Allow lifetime purchase", "السماح بالشراء مدى الحياة"],
  "adminPages.addCourse.priceInvalid": ["Enter a valid price.", "أدخل سعراً صالحاً."],
  "adminPages.addCourse.publishNow": ["Publish immediately (active)", "نشر فوراً (نشط)"],
  "adminPages.addCourse.typeRecorded": ["Recorded", "مسجّل"],

  "adminPages.auditLogs.title": ["Audit logs", "سجلات التدقيق"],
  "adminPages.auditLogs.subtitle": ["Track sensitive admin actions across the platform.", "تتبع إجراءات الإدارة الحساسة عبر المنصة."],
  "adminPages.auditLogs.action": ["Action", "الإجراء"],
  "adminPages.auditLogs.actor": ["Actor", "المنفّذ"],
  "adminPages.auditLogs.entity": ["Entity", "الكيان"],
  "adminPages.auditLogs.entityId": ["Entity ID", "معرّف الكيان"],
  "adminPages.auditLogs.when": ["When", "الوقت"],
  "adminPages.auditLogs.loadError": ["Could not load audit logs.", "تعذّر تحميل سجلات التدقيق."],

  "adminPages.cmsPages.title": ["Site pages", "صفحات الموقع"],
  "adminPages.cmsPages.subtitle": [
    "Edit footer pages in English and Arabic — contact, terms, guide, and more.",
    "عدّل صفحات التذييل بالإنجليزية والعربية — تواصل، الشروط، الدليل، والمزيد.",
  ],
  "adminPages.cmsPages.aboutFaqNote": [
    "About, FAQ, and homepage hero are edited under Site content (/admin/cms). Blog posts under Blog posts.",
    "صفحة من نحن والأسئلة الشائعة وواجهة الصفحة الرئيسية تُعدَّل من محتوى الموقع (/admin/cms). المقالات من قسم المدونة.",
  ],
  "adminPages.cmsPages.addSection": ["Add section", "إضافة قسم"],
  "adminPages.cmsPages.emptySeed": [
    "No pages in database. Run seed or migration to create default pages.",
    "لا توجد صفحات في قاعدة البيانات. شغّل الـ seed أو الترحيل لإنشاء الصفحات الافتراضية.",
  ],
  "adminPages.cmsPages.inbox": ["Contact form inbox", "وارد نموذج التواصل"],
  "adminPages.cmsPages.inboxEmpty": ["No messages yet.", "لا توجد رسائل بعد."],
  "adminPages.cmsPages.markRead": ["Mark as read", "تعليم كمقروء"],
  "adminPages.cmsPages.preview": ["Preview", "معاينة"],
  "adminPages.cmsPages.published": ["Published (visible on site)", "منشور (ظاهر على الموقع)"],
  "adminPages.cmsPages.saved": ["Page saved.", "تم حفظ الصفحة."],
  "adminPages.cmsPages.sectionBody": ["Body text", "نص المحتوى"],
  "adminPages.cmsPages.sectionHeading": ["Heading", "العنوان"],
  "adminPages.cmsPages.sectionList": ["Bullet list (one item per line)", "قائمة نقطية (عنصر في كل سطر)"],
  "adminPages.cmsPages.sections": ["Content sections", "أقسام المحتوى"],
  "adminPages.cmsPages.selectPage": ["Select a page.", "اختر صفحة."],
  "adminPages.cmsPages.subtitleAr": ["Subtitle (Arabic)", "العنوان الفرعي (عربي)"],
  "adminPages.cmsPages.subtitleEn": ["Subtitle (English)", "العنوان الفرعي (إنجليزي)"],
  "adminPages.cmsPages.titleAr": ["Title (Arabic)", "العنوان (عربي)"],
  "adminPages.cmsPages.titleEn": ["Title (English)", "العنوان (إنجليزي)"],

  "adminPages.cmsPosts.bodyAr": ["Body (Arabic)", "المحتوى (عربي)"],
  "adminPages.cmsPosts.catBlog": ["Blog", "مدونة"],
  "adminPages.cmsPosts.category": ["Category", "التصنيف"],
  "adminPages.cmsPosts.catInvestigation": ["Investigation", "تحقيق"],
  "adminPages.cmsPosts.catNews": ["News", "أخبار"],
  "adminPages.cmsPosts.fieldTitleAr": ["Title (Arabic)", "العنوان (عربي)"],

  "adminPages.courseEditor.actions.addSection": ["Add section", "إضافة قسم"],
  "adminPages.courseEditor.actions.deleteSection": ["Delete section", "حذف القسم"],
  "adminPages.courseEditor.confirm.deleteSection": [
    "Delete this section and all its lessons?",
    "حذف هذا القسم وكل دروسه؟",
  ],
  "adminPages.courseEditor.defaults.section": ["Section", "قسم"],
  "adminPages.courseEditor.empty.noSections": ["No sections yet", "لا توجد أقسام بعد"],
  "adminPages.courseEditor.empty.untitledSection": ["Untitled section", "قسم بلا عنوان"],
  "adminPages.courseEditor.staff.add": ["Add", "إضافة"],
  "adminPages.courseEditor.staff.added": ["Staff added", "تمت إضافة الطاقم"],
  "adminPages.courseEditor.staff.addFailed": ["Failed to add staff", "تعذّرت إضافة الطاقم"],
  "adminPages.courseEditor.staff.empty": ["No staff assigned", "لا يوجد طاقم معيّن"],
  "adminPages.courseEditor.staff.removed": ["Staff removed", "تمت إزالة الطاقم"],
  "adminPages.courseEditor.staff.removeFailed": ["Failed to remove staff", "تعذّرت إزالة الطاقم"],
  "adminPages.courseEditor.staff.selectUser": ["Select user", "اختر مستخدماً"],
  "adminPages.courseEditor.staff.title": ["Course staff", "طاقم الكورس"],
  "adminPages.courseEditor.toasts.sectionAdded": ["Section added", "تمت إضافة القسم"],
  "adminPages.courseEditor.toasts.sectionAddFailed": ["Failed to add section", "تعذّرت إضافة القسم"],
  "adminPages.courseEditor.toasts.sectionDeleted": ["Section deleted", "تم حذف القسم"],
  "adminPages.courseEditor.toasts.sectionDeleteFailed": ["Failed to delete section", "تعذّر حذف القسم"],
  "adminPages.courseEditor.toasts.sectionRenameFailed": ["Failed to rename section", "تعذّر إعادة تسمية القسم"],

  "adminPages.instructorDetail.ticketHint": [
    "Creates a support ticket linked to this instructor.",
    "ينشئ تذكرة دعم مرتبطة بهذا المحاضر.",
  ],

  "adminPages.otp.title": ["Verification code", "رمز التحقق"],
  "adminPages.otp.description": ["Enter the one-time code sent to your email.", "أدخل الرمز لمرة واحدة المرسل إلى بريدك."],
  "adminPages.otp.confirm": ["Verify", "تحقق"],
  "adminPages.otp.invalid": ["Invalid or expired code.", "رمز غير صالح أو منتهٍ."],
  "adminPages.otp.resend": ["Resend code", "إعادة إرسال الرمز"],
  "adminPages.otp.sendFailed": ["Could not send code.", "تعذّر إرسال الرمز."],
  "adminPages.otp.sent": ["Code sent.", "تم إرسال الرمز."],
  "adminPages.otp.verifyFailed": ["Verification failed.", "فشل التحقق."],

  "adminPages.packages.card.description": ["Description", "الوصف"],
  "adminPages.packages.stats.inactive": ["Inactive", "غير نشطة"],
  "adminPages.pagination.page": ["Page {{page}} of {{totalPages}}", "صفحة {{page}} من {{totalPages}}"],

  "adminPages.reviewQueue.title": ["Review queue", "قائمة المراجعة"],
  "adminPages.reviewQueue.subtitle": ["Approve or reject pending content and requests.", "وافق أو ارفض المحتوى والطلبات المعلّقة."],
  "adminPages.reviewQueue.approve": ["Approve", "موافقة"],
  "adminPages.reviewQueue.approved": ["Approved.", "تمت الموافقة."],
  "adminPages.reviewQueue.approveFailed": ["Could not approve.", "تعذّرت الموافقة."],
  "adminPages.reviewQueue.confirmReject": ["Reject this item?", "رفض هذا العنصر؟"],
  "adminPages.reviewQueue.instructor": ["Instructor", "المحاضر"],
  "adminPages.reviewQueue.loadError": ["Could not load review queue.", "تعذّر تحميل قائمة المراجعة."],
  "adminPages.reviewQueue.reject": ["Reject", "رفض"],
  "adminPages.reviewQueue.rejected": ["Rejected.", "تم الرفض."],
  "adminPages.reviewQueue.rejectFailed": ["Could not reject.", "تعذّر الرفض."],
  "adminPages.reviewQueue.rejectPlaceholder": ["Reason for rejection…", "سبب الرفض…"],
  "adminPages.reviewQueue.rejectTitle": ["Reject request", "رفض الطلب"],
  "adminPages.reviewQueue.status": ["Status", "الحالة"],

  "adminPages.studentDetail.activateAccount": ["Activate account", "تفعيل الحساب"],
  "adminPages.studentDetail.activated": ["Account activated.", "تم تفعيل الحساب."],
  "adminPages.studentDetail.activityEnroll": ["Enrolled in course ", "سجّل في كورس "],
  "adminPages.studentDetail.activityExam": ["Submitted exam ", "سلّم اختبار "],
  "adminPages.studentDetail.confirmActivate": ["Re-activate this student account?", "إعادة تفعيل حساب هذا الطالب؟"],
  "adminPages.studentDetail.confirmSuspend": [
    "Suspend this student account? They will not be able to sign in.",
    "إيقاف حساب هذا الطالب؟ لن يتمكن من تسجيل الدخول.",
  ],
  "adminPages.studentDetail.deleteConfirmTitle": ["Confirm deletion", "تأكيد الحذف"],
  "adminPages.studentDetail.deleted": ["Student account deleted.", "تم حذف حساب الطالب."],
  "adminPages.studentDetail.deleteFailed": ["Could not delete account.", "تعذّر حذف الحساب."],
  "adminPages.studentDetail.deleteTypeEmail": [
    "Type the student email exactly to confirm deletion.",
    "اكتب بريد الطالب كما هو لتأكيد الحذف.",
  ],
  "adminPages.studentDetail.deleteWarn1": [
    "This will permanently remove the student account (soft delete). Continue?",
    "سيُزال حساب الطالب نهائياً (حذف ناعم). المتابعة؟",
  ],
  "adminPages.studentDetail.loadErrorDesc": [
    "The student profile details could not be retrieved.",
    "تعذّر جلب تفاصيل ملف الطالب.",
  ],
  "adminPages.studentDetail.noActivity": [
    "No recent activities recorded for this student.",
    "لا يوجد نشاط حديث لهذا الطالب.",
  ],
  "adminPages.studentDetail.noCourses": ["Student is not enrolled in any courses.", "الطالب غير مسجّل في أي كورس."],
  "adminPages.studentDetail.passwordResetDone": ["Password updated.", "تم تحديث كلمة المرور."],
  "adminPages.studentDetail.passwordResetFailed": ["Could not reset password.", "تعذّر إعادة تعيين كلمة المرور."],
  "adminPages.studentDetail.savePassword": ["Update password", "تحديث كلمة المرور"],
  "adminPages.studentDetail.sendAndOpenTicket": ["Send & open ticket", "إرسال وفتح التذكرة"],
  "adminPages.studentDetail.suspended": ["Account suspended.", "تم إيقاف الحساب."],
  "adminPages.studentDetail.suspendFailed": ["Could not update account status.", "تعذّر تحديث حالة الحساب."],
  "adminPages.studentDetail.ticketCreated": ["Support ticket created.", "تم إنشاء تذكرة الدعم."],
  "adminPages.studentDetail.ticketFailed": ["Could not create ticket.", "تعذّر إنشاء التذكرة."],
  "adminPages.studentDetail.ticketValidation": [
    "Subject and message (min 10 chars) are required.",
    "الموضوع والرسالة (10 أحرف على الأقل) مطلوبان.",
  ],
  "adminPages.students.passwordMin": ["Password must be at least 8 characters.", "يجب أن تكون كلمة المرور 8 أحرف على الأقل."],

  "adminPages.subscriptions.title": ["Subscriptions", "الاشتراكات"],
  "adminPages.subscriptions.subtitle": ["Manage user subscription access", "إدارة وصول اشتراكات المستخدمين"],

  "adminPages.tickets.replyFailed": ["Could not send reply.", "تعذّر إرسال الرد."],
  "adminPages.tickets.replySent": ["Reply sent.", "تم إرسال الرد."],

  "adminPages.userDetail.devices": ["Devices", "الأجهزة"],
  "adminPages.userDetail.directPermissions": ["Direct permissions", "صلاحيات مباشرة"],
  "adminPages.userDetail.forceLogout": ["Force logout", "تسجيل خروج إجباري"],
  "adminPages.userDetail.forceLogoutDone": ["User logged out from all sessions.", "تم تسجيل خروج المستخدم من كل الجلسات."],
  "adminPages.userDetail.grant": ["Grant", "منح"],
  "adminPages.userDetail.grantPermission": ["Grant permission", "منح صلاحية"],
  "adminPages.userDetail.noDevices": ["No devices recorded.", "لا توجد أجهزة مسجّلة."],
  "adminPages.userDetail.noDirectPermissions": ["No direct permissions.", "لا توجد صلاحيات مباشرة."],
  "adminPages.userDetail.noPermissionGrant": ["Select a permission first.", "اختر صلاحية أولاً."],
  "adminPages.userDetail.noSessions": ["No active sessions.", "لا توجد جلسات نشطة."],
  "adminPages.userDetail.permissionGranted": ["Permission granted.", "تم منح الصلاحية."],
  "adminPages.userDetail.permissionGrantFailed": ["Could not grant permission.", "تعذّر منح الصلاحية."],
  "adminPages.userDetail.quickLinks": ["Quick links", "روابط سريعة"],
  "adminPages.userDetail.revoke": ["Revoke", "سحب"],
  "adminPages.userDetail.selectPermission": ["Select permission", "اختر صلاحية"],
  "adminPages.userDetail.sessions": ["Sessions", "الجلسات"],
  "adminPages.userDetail.tabs.overview": ["Overview", "نظرة عامة"],
  "adminPages.userDetail.tabs.permissions": ["Permissions", "الصلاحيات"],
  "adminPages.userDetail.tabs.sessions": ["Sessions", "الجلسات"],
  "adminPages.userDirectory.slideRole.select": ["Select role", "اختر الدور"],
};

const assignmentAr = {
  hubTitle: "الواجبات حسب الدفعة",
  hubSubtitle: "اختر دفعة لعرض الواجبات.",
  openCohort: "عرض الواجبات",
  loadError: "تعذّر تحميل الواجبات.",
  emptyCohort: "لا واجبات لهذه الدفعة.",
  hubLoadError: "تعذّر تحميل الواجبات.",
  hubEmpty: "لا واجبات لصفوفك بعد.",
  emptyFilter: "لا واجبات تطابق البحث أو الدفعة المختارة.",
  showingNone: "لا واجبات للعرض",
  showingRange: "عرض {{from}}–{{to}} من {{total}} نتيجة",
  searchAria: "بحث",
  titlePrefix: "واجباتي",
  titleAccent: "",
  subtitle: "تتبع وتسليم واجباتك",
  viewCourse: "كل واجبات الكورس",
  courseListSubtitle: "واجبات هذا الكورس",
  due: "الموعد النهائي:",
  submitted: "تم التسليم:",
  grade: "الدرجة:",
  gradePct: "الدرجة: {{pct}}٪",
  searchPlaceholder: "ابحث عن الواجبات…",
  showing: "عرض {{count}} من {{total}} واجب",
  contextLine: "{{courseTitle}} · {{cohortName}}",
  daysLeft: "({{n}} يوم متبقٍ)",
  overdue: "متأخر {{n}} يوماً",
  type: {
    TEXT: "إجابة كتابية",
    FILE: "رفع ملف",
    LINK: "تسليم برابط",
  },
  status: {
    pending: "لم يبدأ",
    submitted: "تم التسليم",
    underReview: "قيد المراجعة",
    completed: "مكتمل",
    late: "متأخر",
  },
  filter: {
    all: "جميع الحالات",
    allClasses: "جميع الدفعات",
  },
  actions: {
    submit: "تسليم الواجب",
    viewDetails: "عرض التفاصيل",
    viewResults: "عرض النتائج",
  },
  stats: {
    total: "الإجمالي",
    pending: "معلق",
    submitted: "قيد المراجعة",
    completed: "مكتمل",
  },
};

const assignmentDetailAr = {
  typeLabel: "نوع التسليم",
  submitError: "فشل التسليم.",
  validation: {
    text: "يرجى إدخال إجابتك.",
    link: "يرجى إدخال رابط صالح.",
    file: "يرجى اختيار ملف أو لصق رابط ملف.",
  },
  fileOrUrlHint: "ارفع ملفاً مباشرة، أو الصق رابط ملف مستضاف.",
  fileUrlPlaceholder: "الصق رابط الملف المستضاف",
  fileReady: "تم إرفاق الملف.",
  fileTooBig: "الملف كبير جداً (الحد 8MB).",
  fileReadError: "تعذّر قراءة الملف.",
  notFound: "الواجب غير موجود.",
  back: "العودة إلى الواجبات",
  due: "الموعد النهائي:",
  instructions: { title: "التعليمات" },
  requirements: {
    title: "المتطلبات",
    fallbackDefault: "اتبع توجيهات محاضرك وسلّم قبل الموعد النهائي.",
    fallback: {
      TEXT: "سلّم إجابة كتابية كما هو موضّح في التعليمات.",
      FILE: "ارفع الملفات المطلوبة (صوت أو PDF أو صور) ضمن الحد المسموح.",
      LINK: "سلّم رابطاً صالحاً لعملك المكتمل.",
    },
  },
  contextSubtitle: "{{courseTitle}} · {{cohortName}}",
  submitCard: {
    title: "تسليم واجبك",
    answerLabel: "إجابتك",
    answerPlaceholder: "اكتب إجاباتك هنا...",
    uploadLabel: "رفع الملفات",
    submitBtn: "تسليم الواجب",
    submitting: "جارٍ التسليم…",
  },
  upload: {
    cta: "انقر للرفع أو اسحب وأفلت",
    hint: "ملفات صوت أو PDF أو صور (حد أقصى 10MB لكل ملف)",
  },
  sidebar: {
    relatedTitle: "الصف المرتبط",
    viewClassBtn: "عرض تفاصيل الصف",
    tipsTitle: "نصائح التسليم",
    tip1: "راجع الإملاء والنص قبل التسليم.",
    tip2: "اجعل التسجيلات الصوتية واضحة وسهلة السماع.",
    tip3: "استخدم أنواع الملفات وأحجامها الموضحة أعلاه.",
    tip4: "سلّم قبل الموعد النهائي لتجنب حالة التأخر.",
  },
  successTitle: "تم تسليم الواجب!",
  gradedTitle: "تسليم مُقيَّم",
  downloadSubmission: "تحميل الملف المُسلَّم",
  resubmitTitle: "تحديث التسليم",
  resubmitBtn: "تحديث التسليم",
  successMsg: "تم استلام تسليمك. سيراجعه معلمك قريباً.",
  backBtn: "العودة إلى الواجبات",
};

const instructorCohortsAr = {
  allStatuses: "كل الحالات",
  upcoming: "قادم",
  ongoing: "جاري",
  completed: "مكتمل",
  nameCol: "الدفعة",
  courseCol: "الكورس",
  type: "النوع",
  status: "الحالة",
  startDate: "تاريخ البدء",
  students: "الطلاب",
  emptyTitle: "لا توجد دفعات",
  emptyDescription: "لا توجد دفعات مطابقة لهذا الفلتر.",
};

const instructorAssignmentQueueAr = {
  notOpened: "لم تُفتح",
  opened: "مفتوحة",
  closed: "مغلقة / مُقيَّمة",
  stateLabel: "حالة مراجعتك",
  markOpened: "تعليم كمفتوحة",
  markClosed: "إغلاق بدون درجة",
  resetNew: "تعليم كغير مفتوحة",
  emptyFilter: "لا تسليمات في هذا الفلتر.",
  emptyAll:
    "عند تسليم الطلاب للواجبات ستظهر هنا. أنشئ الواجبات من محرر الكورس (تبويب الواجب).",
  goToCourses: "الانتقال إلى كورساتي",
  emptyTitle: "لا تسليمات بعد",
  stateUpdated: "تم تحديث حالة المراجعة.",
};

const ar = JSON.parse(fs.readFileSync(arPath, "utf8"));
const en = JSON.parse(fs.readFileSync(enPath, "utf8"));

let added = 0;
for (const [key, [enVal, arVal]] of Object.entries(pairs)) {
  const beforeAr = JSON.stringify(ar);
  setPath(ar, key, arVal);
  setPath(en, key, enVal);
  if (JSON.stringify(ar) !== beforeAr) added++;
}

ar.assignment = assignmentAr;
ar.assignmentDetail = assignmentDetailAr;
if (ar.dashboard?.instructor) {
  ar.dashboard.instructor.cohorts = {
    ...(ar.dashboard.instructor.cohorts || {}),
    ...instructorCohortsAr,
  };
  ar.dashboard.instructor.assignment = {
    ...(ar.dashboard.instructor.assignment || {}),
    queue: {
      ...(ar.dashboard.instructor.assignment?.queue || {}),
      ...instructorAssignmentQueueAr,
    },
  };
}

fs.writeFileSync(arPath, JSON.stringify(ar, null, 2) + "\n");
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + "\n");
console.log("Merged missing keys. Newly set paths approx:", added);
console.log("assignment + instructor leftovers overwritten in ar.json");
