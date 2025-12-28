import { Clock, Gift, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Survey } from "@/types/survey";

interface SurveyCardProps {
  survey: Survey;
  isCompanyView?: boolean;
}

const SurveyCard = ({ survey, isCompanyView = false }: SurveyCardProps) => {
  const daysLeft = Math.ceil(
    (new Date(survey.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Card className="hover:shadow-elegant transition-all duration-300 border-border/50">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <img
            src={survey.companyLogo}
            alt={survey.companyName}
            className="w-14 h-14 rounded-xl object-cover bg-muted"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-muted-foreground">{survey.companyName}</span>
              <Badge
                variant={survey.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {survey.status === 'active' ? 'Aktiv' : survey.status === 'draft' ? 'Qaralama' : 'Bağlı'}
              </Badge>
            </div>
            <h3 className="font-semibold text-lg text-foreground truncate">{survey.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2 mt-1">{survey.description}</p>
            
            <div className="flex items-center gap-4 mt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{daysLeft > 0 ? `${daysLeft} gün qaldı` : 'Vaxtı bitib'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{survey.responseCount} cavab</span>
              </div>
              {survey.reward && (
                <div className="flex items-center gap-1 text-gold">
                  <Gift className="w-4 h-4" />
                  <span>{survey.reward}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex-shrink-0">
            {isCompanyView ? (
              <Link to={`/surveys/${survey.id}/results`}>
                <Button variant="outline" size="sm">Nəticələr</Button>
              </Link>
            ) : (
              <Link to={`/surveys/${survey.id}`}>
                <Button variant="gold" size="sm">Cavabla</Button>
              </Link>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SurveyCard;
