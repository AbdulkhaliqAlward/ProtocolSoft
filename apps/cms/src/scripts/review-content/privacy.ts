/**
 * Privacy policy content (AR + EN), written from what the site actually does:
 * the contact-form fields, a one-way IP hash for rate limiting, a 12-month lead
 * retention setting, a single theme preference in localStorage, no tracking or
 * advertising cookies. It names no legal entity, address or contact channel:
 * the contact form is the privacy channel until those facts are supplied.
 *
 * Legal pages stay behind the legal gate: in production a Super Admin records
 * the legal review and publishes. This text is the starting point for that
 * review, not a substitute for it.
 */
type Body = Array<string | string[]>;
interface Clause { heading: string; body: Body }

const text = (value: string) => ({ type: 'text' as const, detail: 0, format: 0, mode: 'normal' as const, style: '', text: value, version: 1 });

const toLexical = (body: Body, direction: 'rtl' | 'ltr') => ({
  root: {
    type: 'root' as const,
    direction,
    format: '' as const,
    indent: 0,
    version: 1,
    children: body.map((part) =>
      Array.isArray(part)
        ? {
            type: 'list' as const,
            listType: 'bullet' as const,
            tag: 'ul' as const,
            start: 1,
            direction,
            format: '' as const,
            indent: 0,
            version: 1,
            children: part.map((item, i) => ({ type: 'listitem' as const, value: i + 1, direction, format: '' as const, indent: 0, version: 1, children: [text(item)] })),
          }
        : { type: 'paragraph' as const, direction, format: '' as const, indent: 0, version: 1, textFormat: 0, children: [text(part)] },
    ),
  },
});

const AR: Clause[] = [
  {
    heading: 'نطاق هذه السياسة',
    body: [
      'توضح هذه السياسة كيف تتعامل بروتوكول سوفت مع البيانات الشخصية التي تصلنا عبر هذا الموقع: ما الذي نجمعه، ولماذا، ومدة الاحتفاظ به، ومن يطّلع عليه، وما حقوقك تجاهه.',
      'نلتزم في ذلك بأنظمة حماية البيانات الشخصية المعمول بها ولوائحها التنفيذية.',
    ],
  },
  {
    heading: 'البيانات التي نجمعها',
    body: [
      'لا نجمع بيانات شخصية إلا عندما ترسل إلينا طلباً عبر نموذج التواصل. وعندها نحفظ:',
      [
        'الاسم الكامل والبريد الإلكتروني.',
        'اسم الجهة ورقم الجوال، إن اخترت إدخالهما.',
        'الخدمة التي تهتم بها، ونص رسالتك.',
        'لغة الصفحة والصفحة التي أُرسل منها الطلب، ووقت الإرسال.',
        'قيمة مشفّرة باتجاه واحد مشتقة من عنوان IP. لا نحفظ العنوان نفسه، ولا يمكن استرجاعه من هذه القيمة، ونستخدمها فقط للحد من الطلبات المتكررة والآلية.',
      ],
      'لا يطلب النموذج أي بيانات حساسة. ونرجو ألا تضمّن رسالتك كلمات مرور أو بيانات دخول أو تفاصيل أمنية سرية؛ سنطلب ما نحتاجه منها لاحقاً عبر قناة مناسبة إن لزم.',
    ],
  },
  {
    heading: 'ما لا نجمعه',
    body: [
      [
        'لا نستخدم ملفات تعريف الارتباط (الكوكيز) للإعلانات، ولا لتتبعك بين المواقع.',
        'لا يستخدم الموقع أدوات تحليل تتعقب الزوار بشكل فردي.',
        'لا نبيع بياناتك ولا نؤجرها، ولا نشاركها لأغراض تسويقية.',
      ],
    ],
  },
  {
    heading: 'كيف نستخدم بياناتك',
    body: [
      [
        'للرد على طلبك ومتابعته، وترتيب جلسة استكشاف إن كان ذلك مناسباً.',
        'لتوجيه طلبك إلى المختص بالخدمة التي اخترتها.',
        'لحماية الموقع والنموذج من الإساءة والرسائل الآلية.',
      ],
      'لا نستخدم بيانات التواصل لإرسال رسائل تسويقية إليك دون موافقة مستقلة منك.',
    ],
  },
  {
    heading: 'الأساس النظامي للمعالجة',
    body: [
      'نعالج بياناتك بناءً على موافقتك التي تمنحها عند إرسال النموذج، ولغرض الرد على طلب قدّمته أنت. يمكنك سحب موافقتك في أي وقت، ولا يؤثر سحبها على ما تمّت معالجته قبل ذلك.',
    ],
  },
  {
    heading: 'من يطّلع على بياناتك',
    body: [
      [
        'أعضاء فريقنا المخوّلون بمتابعة الطلبات فقط، وفق صلاحيات محددة لكل دور.',
        'مزوّدو خدمات تقنية نعتمد عليهم في تشغيل الموقع، مثل الاستضافة والحماية من الهجمات وإرسال إشعارات البريد الإلكتروني. يعالج هؤلاء البيانات نيابةً عنا ووفق تعليماتنا فقط.',
        'الجهات الرسمية المختصة، إذا طُلب منا ذلك بموجب نظام أو أمر قضائي.',
      ],
      'قد تعمل بعض هذه الخدمات التقنية من دول أخرى. وفي هذه الحالة نلتزم بالضوابط النظامية لنقل البيانات الشخصية عبر الحدود.',
    ],
  },
  {
    heading: 'مدة الاحتفاظ',
    body: [
      'نحتفظ ببيانات طلبات التواصل مدة لا تتجاوز اثني عشر شهراً من تاريخ استلامها، ثم نحذفها أو نحوّلها إلى صيغة لا تحدد هويتك. ويُستثنى من ذلك ما تنشأ عنه علاقة تعاقدية بيننا وتوجب الأنظمة الاحتفاظ به مدة أطول.',
    ],
  },
  {
    heading: 'كيف نحمي بياناتك',
    body: [
      [
        'تنتقل البيانات بين متصفحك والموقع عبر اتصال مشفّر (HTTPS).',
        'لوحة إدارة المحتوى والطلبات غير متاحة للعموم، والوصول إليها مقيّد بصلاحيات محددة لكل دور.',
        'نسجّل عمليات الوصول والتعديل المهمة في سجل تدقيق داخلي.',
      ],
      'لا توجد وسيلة نقل أو تخزين آمنة تماماً، لكننا نطبّق ضوابط معقولة ومتناسبة مع طبيعة البيانات التي نتعامل معها.',
    ],
  },
  {
    heading: 'ما يحفظه الموقع في متصفحك',
    body: [
      'يحفظ الموقع في متصفحك خياراً واحداً فقط: تفضيلك للوضع الفاتح أو الداكن. لا يُرسل هذا الخيار إلينا، ويمكنك حذفه بمسح بيانات الموقع من إعدادات متصفحك.',
    ],
  },
  {
    heading: 'حقوقك',
    body: [
      'وفق أنظمة حماية البيانات الشخصية، يحق لك:',
      [
        'أن تعرف كيف نجمع بياناتك ونعالجها، والغرض من ذلك.',
        'الوصول إلى بياناتك والحصول على نسخة منها.',
        'طلب تصحيح بياناتك أو تحديثها أو إكمالها.',
        'طلب إتلاف بياناتك متى انتفت الحاجة إليها.',
        'سحب موافقتك على المعالجة.',
      ],
      'لممارسة أي من هذه الحقوق، راسلنا عبر نموذج التواصل واختر «استفسار عام»، واذكر رقم طلبك المرجعي إن كان لديك. وإن رأيت أن بياناتك عولجت بما يخالف النظام، فيحق لك تقديم شكوى إلى الجهة المختصة بحماية البيانات.',
    ],
  },
  {
    heading: 'الروابط الخارجية',
    body: ['قد يحتوي الموقع على روابط لمواقع أخرى، مثل حساباتنا على شبكات التواصل. لا تنطبق هذه السياسة على تلك المواقع، ولكل منها سياسة خصوصية خاصة بها.'],
  },
  {
    heading: 'تحديث هذه السياسة',
    body: ['قد نحدّث هذه السياسة عندما تتغير طريقة عمل الموقع أو الأنظمة المعمول بها. ننشر النسخة المحدثة في هذه الصفحة، ويسري التحديث من تاريخ نشره.'],
  },
  {
    heading: 'التواصل بشأن الخصوصية',
    body: ['لأي سؤال عن هذه السياسة أو عن بياناتك، تواصل معنا عبر نموذج التواصل واختر «استفسار عام» في حقل الخدمة.'],
  },
];

const EN: Clause[] = [
  {
    heading: 'Scope of this policy',
    body: [
      'This policy explains how Protocol Soft handles personal data that reaches us through this website: what we collect, why, how long we keep it, who can see it, and your rights over it.',
      'We follow the applicable personal data protection laws and their implementing regulations.',
    ],
  },
  {
    heading: 'Data we collect',
    body: [
      'We only collect personal data when you send us a request through the contact form. We then store:',
      [
        'Your full name and email address.',
        'Your organisation and phone number, if you choose to provide them.',
        'The service you are interested in and your message.',
        'The page language, the page the request was sent from, and the time it was sent.',
        'A one-way encrypted value derived from your IP address. We do not store the address itself, it cannot be recovered from this value, and we use it only to limit repeated and automated submissions.',
      ],
      'The form does not ask for sensitive data. Please do not include passwords, login details or confidential security information in your message; if we need any of it later, we will ask through an appropriate channel.',
    ],
  },
  {
    heading: 'What we do not collect',
    body: [
      [
        'We do not use cookies for advertising or to track you across websites.',
        'The website does not use analytics tools that follow individual visitors.',
        'We do not sell or rent your data, or share it for marketing purposes.',
      ],
    ],
  },
  {
    heading: 'How we use your data',
    body: [
      [
        'To reply to and follow up on your request, and to arrange a discovery session where appropriate.',
        'To route your request to the person responsible for the service you chose.',
        'To protect the website and the form from abuse and automated messages.',
      ],
      'We do not use your contact details to send you marketing messages without your separate consent.',
    ],
  },
  {
    heading: 'Legal basis for processing',
    body: [
      'We process your data based on the consent you give when you submit the form, and in order to respond to a request you made. You can withdraw your consent at any time; this does not affect processing carried out before you withdrew it.',
    ],
  },
  {
    heading: 'Who can see your data',
    body: [
      [
        'Only team members authorised to handle requests, with access limited by role.',
        'Technical service providers we rely on to run the website, such as hosting, attack protection and email notifications. They process data on our behalf and only on our instructions.',
        'Competent authorities, where required by law or a court order.',
      ],
      'Some of these technical services may operate from other countries. Where that is the case, we follow the legal requirements for transferring personal data across borders.',
    ],
  },
  {
    heading: 'How long we keep it',
    body: [
      'We keep contact-request data for no longer than twelve months from the date we receive it, then delete it or make it anonymous. The exception is data connected to a contractual relationship between us that the law requires us to keep for longer.',
    ],
  },
  {
    heading: 'How we protect your data',
    body: [
      [
        'Data travels between your browser and the website over an encrypted connection (HTTPS).',
        'The content and request administration panel is not publicly accessible, and access to it is limited by role.',
        'Significant access and changes are recorded in an internal audit log.',
      ],
      'No method of transmission or storage is completely secure, but we apply reasonable controls proportionate to the data we handle.',
    ],
  },
  {
    heading: 'What the website stores in your browser',
    body: [
      'The website stores a single choice in your browser: whether you prefer the light or dark theme. It is never sent to us, and you can remove it by clearing this site’s data in your browser settings.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'Under personal data protection law, you have the right to:',
      [
        'Know how we collect and process your data, and why.',
        'Access your data and obtain a copy of it.',
        'Ask us to correct, update or complete your data.',
        'Ask us to destroy your data once it is no longer needed.',
        'Withdraw your consent to processing.',
      ],
      'To exercise any of these rights, write to us through the contact form, choose “General Inquiry”, and include your request reference code if you have one. If you believe your data has been processed in breach of the law, you may file a complaint with the competent data protection authority.',
    ],
  },
  {
    heading: 'External links',
    body: ['The website may link to other sites, such as our social media accounts. This policy does not apply to those sites, each of which has its own privacy policy.'],
  },
  {
    heading: 'Changes to this policy',
    body: ['We may update this policy when the way the website works, or the applicable regulations, change. We publish the updated version on this page, and it takes effect from the date it is published.'],
  },
  {
    heading: 'Privacy questions',
    body: ['For any question about this policy or your data, contact us through the contact form and choose “General Inquiry” in the service field.'],
  },
];

const blocks = (clauses: Clause[], direction: 'rtl' | 'ltr') =>
  clauses.map((c) => ({ blockType: 'contentRichText' as const, heading: c.heading, content: toLexical(c.body, direction) }));

export const PRIVACY = {
  ar: { title: 'سياسة الخصوصية', blocks: blocks(AR, 'rtl'), seoDescription: 'كيف تتعامل بروتوكول سوفت مع البيانات الشخصية التي تصلها عبر الموقع، ومدة الاحتفاظ بها، وحقوقك تجاهها.' },
  en: { title: 'Privacy Policy', blocks: blocks(EN, 'ltr'), seoDescription: 'How Protocol Soft handles personal data received through this website, how long it is kept, and your rights over it.' },
};
