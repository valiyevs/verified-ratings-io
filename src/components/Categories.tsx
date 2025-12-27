import { 
  Building2, 
  Smartphone, 
  ShoppingBag, 
  Shield, 
  Car, 
  Utensils,
  Plane,
  HeartPulse
} from "lucide-react";

const categories = [
  { name: "Banklar", icon: Building2, count: 45, color: "bg-blue-500" },
  { name: "Telekommunikasiya", icon: Smartphone, count: 12, color: "bg-purple-500" },
  { name: "Retail", icon: ShoppingBag, count: 234, color: "bg-pink-500" },
  { name: "Sığorta", icon: Shield, count: 28, color: "bg-green-500" },
  { name: "Nəqliyyat", icon: Car, count: 67, color: "bg-orange-500" },
  { name: "Restoran & Kafe", icon: Utensils, count: 456, color: "bg-red-500" },
  { name: "Turizm", icon: Plane, count: 89, color: "bg-cyan-500" },
  { name: "Səhiyyə", icon: HeartPulse, count: 123, color: "bg-rose-500" },
];

const Categories = () => {
  return (
    <section id="categories" className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Kateqoriyalar üzrə Axtarış
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Maraqlandığınız sahə üzrə şirkətləri kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <button
              key={category.name}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 text-left border border-border/50 animate-fade-up"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className={`w-14 h-14 ${category.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} şirkət</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;
