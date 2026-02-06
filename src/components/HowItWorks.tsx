import { UserCheck, Search, Star, BarChart3 } from "lucide-react";

const steps = [
  {
    icon: UserCheck,
    title: "AI ilə Qeydiyyat",
    description: "FİN kod və ya AI ilə bir dəfəlik doğrulama. Saxta hesabları istisna edirik.",
  },
  {
    icon: Search,
    title: "Şirkət Tapın",
    description: "Axtarış və filtrlər vasitəsilə maraqlandığınız şirkəti tapın.",
  },
  {
    icon: Star,
    title: "Rəy Yazın",
    description: "Təcrübənizi bölüşün, qəbz əlavə edin və digər istifadəçilərə kömək edin.",
  },
  {
    icon: BarChart3,
    title: "Müqayisə Edin",
    description: "Şirkətləri yan-yana müqayisə edərək ən yaxşı seçimi tapın.",
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-20 bg-gradient-hero text-primary-foreground relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-40 h-40 border border-current rounded-full" />
        <div className="absolute bottom-10 right-10 w-60 h-60 border border-current rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-current rounded-full" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-3">
            Necə İşləyir?
          </h2>
          <p className="text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            4 sadə addımda şəffaf və etibarlı rəy ekosistemasına qoşulun
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative animate-fade-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+3rem)] w-[calc(100%-3rem)] h-0.5 bg-primary-foreground/20" />
              )}

              <div className="text-center">
                {/* Step number */}
                <div className="w-20 h-20 bg-primary-foreground/10 backdrop-blur rounded-2xl flex items-center justify-center mx-auto mb-6 relative">
                  <step.icon className="w-10 h-10" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-accent text-accent-foreground rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="font-semibold text-xl mb-2">{step.title}</h3>
                <p className="text-primary-foreground/70">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
