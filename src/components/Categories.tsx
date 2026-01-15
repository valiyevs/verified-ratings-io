import { useNavigate } from "react-router-dom";
import { 
  Building2, 
  Smartphone, 
  ShoppingBag, 
  Shield, 
  Car, 
  Utensils,
  Plane,
  HeartPulse,
  Sparkles
} from "lucide-react";

const categories = [
  { name: "Banklar", icon: Building2, count: 45, gradient: "from-blue-500 to-blue-600" },
  { name: "Telekommunikasiya", icon: Smartphone, count: 12, gradient: "from-purple-500 to-purple-600" },
  { name: "Retail", icon: ShoppingBag, count: 234, gradient: "from-pink-500 to-rose-500" },
  { name: "Sığorta", icon: Shield, count: 28, gradient: "from-emerald-500 to-green-500" },
  { name: "Nəqliyyat", icon: Car, count: 67, gradient: "from-orange-500 to-amber-500" },
  { name: "Restoran & Kafe", icon: Utensils, count: 456, gradient: "from-red-500 to-rose-500" },
  { name: "Turizm", icon: Plane, count: 89, gradient: "from-cyan-500 to-teal-500" },
  { name: "Səhiyyə", icon: HeartPulse, count: 123, gradient: "from-rose-500 to-pink-500" },
];

const Categories = () => {
  const navigate = useNavigate();

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/search?category=${encodeURIComponent(categoryName)}`);
  };

  return (
    <section id="categories" className="py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-secondary/20 to-transparent" />
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            Kateqoriyalar
          </div>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            Kateqoriyalar üzrə Axtarış
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Maraqlandığınız sahə üzrə şirkətləri kəşf edin
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <button
              key={category.name}
              onClick={() => handleCategoryClick(category.name)}
              className="group bg-card rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 text-left border border-border/50 animate-fade-up relative overflow-hidden"
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {/* Hover gradient overlay */}
              <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
              
              <div className={`w-14 h-14 bg-gradient-to-br ${category.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                <category.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{category.name}</h3>
              <p className="text-sm text-muted-foreground">{category.count} şirkət</p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Categories;