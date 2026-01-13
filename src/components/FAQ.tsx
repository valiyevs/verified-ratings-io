import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const FAQ = () => {
  const { language } = useLanguage();

  const faqData = {
    az: [
      {
        question: "ratings.az nədir?",
        answer: "ratings.az Azərbaycanda şirkətlərin müştəri rəylərinə əsaslanan şəffaf reytinq platformasıdır. Real istifadəçilər öz təcrübələrini paylaşır və digərlərinə düzgün seçim etməkdə kömək edir."
      },
      {
        question: "Rəy yazmaq üçün qeydiyyatdan keçmək lazımdırmı?",
        answer: "Bəli, şəffaflığı təmin etmək üçün istifadəçilər SİMA və ya email ilə qeydiyyatdan keçməlidir. Bu, saxta rəylərin qarşısını alır və platformanın etibarlılığını artırır."
      },
      {
        question: "Bir şirkətə neçə rəy yaza bilərəm?",
        answer: "Hər istifadəçi eyni şirkətə 12 ayda bir dəfə rəy yaza bilər. Bu, rəylərin müxtəlif təcrübələrə əsaslanmasını təmin edir."
      },
      {
        question: "Rəyim nə vaxt yayımlanacaq?",
        answer: "Rəylər göndərildikdən sonra AI tərəfindən analiz edilir. Uyğun rəylər dərhal yayımlanır, şübhəli rəylər isə moderator yoxlamasından keçir."
      },
      {
        question: "Şirkət olaraq qeydiyyatdan necə keçə bilərəm?",
        answer: "Şirkət hesabı yaratmaq üçün 'Şirkət əlavə et' bölməsindən müraciət edin. Şirkət məlumatları admin tərəfindən yoxlanıldıqdan sonra hesabınız aktivləşdiriləcək."
      },
      {
        question: "Şirkətlər rəylərə cavab verə bilirlərmi?",
        answer: "Bəli, təsdiqlənmiş şirkət hesabları müştəri rəylərinə rəsmi cavab yaza bilər. Bu, müştəri-şirkət ünsiyyətini gücləndirir."
      },
      {
        question: "Sorğulara qatılmağın faydası nədir?",
        answer: "Şirkətlər tərəfindən yaradılan sorğulara cavab verməklə müxtəlif mükafatlar qazana bilərsiniz. Sorğular müştəri təcrübəsini yaxşılaşdırmaq üçün istifadə olunur."
      },
      {
        question: "Saxta rəylərin qarşısı necə alınır?",
        answer: "Platform bir neçə təhlükəsizlik mexanizmi istifadə edir: SİMA doğrulaması, AI analizi, 12 aylıq rəy limiti və moderator yoxlaması."
      }
    ],
    en: [
      {
        question: "What is ratings.az?",
        answer: "ratings.az is a transparent rating platform in Azerbaijan based on customer reviews of companies. Real users share their experiences and help others make the right choices."
      },
      {
        question: "Do I need to register to write a review?",
        answer: "Yes, to ensure transparency, users must register via SIMA or email. This prevents fake reviews and increases platform reliability."
      },
      {
        question: "How many reviews can I write for a company?",
        answer: "Each user can write a review for the same company once every 12 months. This ensures reviews are based on diverse experiences."
      },
      {
        question: "When will my review be published?",
        answer: "Reviews are analyzed by AI after submission. Appropriate reviews are published immediately, while suspicious reviews undergo moderator review."
      },
      {
        question: "How can I register as a company?",
        answer: "To create a company account, apply through the 'Add company' section. Your account will be activated after admin verification."
      },
      {
        question: "Can companies respond to reviews?",
        answer: "Yes, verified company accounts can write official responses to customer reviews. This strengthens customer-company communication."
      },
      {
        question: "What are the benefits of participating in surveys?",
        answer: "By answering surveys created by companies, you can earn various rewards. Surveys are used to improve customer experience."
      },
      {
        question: "How are fake reviews prevented?",
        answer: "The platform uses several security mechanisms: SIMA verification, AI analysis, 12-month review limit, and moderator review."
      }
    ],
    ru: [
      {
        question: "Что такое ratings.az?",
        answer: "ratings.az - это прозрачная рейтинговая платформа в Азербайджане, основанная на отзывах клиентов о компаниях. Реальные пользователи делятся своим опытом и помогают другим сделать правильный выбор."
      },
      {
        question: "Нужно ли регистрироваться, чтобы написать отзыв?",
        answer: "Да, для обеспечения прозрачности пользователи должны зарегистрироваться через SIMA или email. Это предотвращает фальшивые отзывы и повышает надежность платформы."
      },
      {
        question: "Сколько отзывов я могу написать для одной компании?",
        answer: "Каждый пользователь может написать отзыв для одной компании раз в 12 месяцев. Это обеспечивает разнообразие опыта в отзывах."
      },
      {
        question: "Когда мой отзыв будет опубликован?",
        answer: "Отзывы анализируются ИИ после отправки. Подходящие отзывы публикуются сразу, а подозрительные проходят проверку модератора."
      },
      {
        question: "Как я могу зарегистрироваться как компания?",
        answer: "Чтобы создать аккаунт компании, подайте заявку через раздел 'Добавить компанию'. Ваш аккаунт будет активирован после проверки администратором."
      },
      {
        question: "Могут ли компании отвечать на отзывы?",
        answer: "Да, подтвержденные аккаунты компаний могут писать официальные ответы на отзывы клиентов. Это укрепляет связь между клиентом и компанией."
      },
      {
        question: "Какова польза от участия в опросах?",
        answer: "Отвечая на опросы, созданные компаниями, вы можете получить различные награды. Опросы используются для улучшения обслуживания клиентов."
      },
      {
        question: "Как предотвращаются фальшивые отзывы?",
        answer: "Платформа использует несколько механизмов безопасности: верификация SIMA, анализ ИИ, лимит отзывов в 12 месяцев и проверка модератором."
      }
    ]
  };

  const faqs = faqData[language] || faqData.az;

  const titles = {
    az: { title: "Tez-tez Verilən Suallar", subtitle: "Platformamız haqqında ən çox soruşulan suallar" },
    en: { title: "Frequently Asked Questions", subtitle: "Most commonly asked questions about our platform" },
    ru: { title: "Часто Задаваемые Вопросы", subtitle: "Наиболее часто задаваемые вопросы о нашей платформе" }
  };

  const { title, subtitle } = titles[language] || titles.az;

  return (
    <section id="faq" className="py-20 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            {title}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {subtitle}
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card rounded-xl border border-border px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;