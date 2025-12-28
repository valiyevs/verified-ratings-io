import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { SurveyQuestion } from "@/types/survey";

const questionTypes = [
  { value: "single", label: "Tək seçim" },
  { value: "multiple", label: "Çoxlu seçim" },
  { value: "rating", label: "Reytinq (1-5)" },
  { value: "text", label: "Açıq cavab" },
];

const CreateSurveyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [reward, setReward] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [questions, setQuestions] = useState<SurveyQuestion[]>([
    { id: "q1", type: "single", question: "", options: [""] }
  ]);

  const addQuestion = () => {
    const newId = `q${questions.length + 1}`;
    setQuestions([...questions, { id: newId, type: "single", question: "", options: [""] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    
    // Reset options when changing type
    if (field === "type") {
      if (value === "rating" || value === "text") {
        delete updated[index].options;
      } else {
        updated[index].options = [""];
      }
    }
    
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) {
      updated[questionIndex].options = [];
    }
    updated[questionIndex].options!.push("");
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    updated[questionIndex].options![optionIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options!.length > 1) {
      updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
      setQuestions(updated);
    }
  };

  const handleSubmit = () => {
    // Validation
    if (!title.trim()) {
      toast({ title: "Sorğu başlığını daxil edin", variant: "destructive" });
      return;
    }
    if (!description.trim()) {
      toast({ title: "Sorğu təsvirini daxil edin", variant: "destructive" });
      return;
    }
    if (!expiresAt) {
      toast({ title: "Bitmə tarixini seçin", variant: "destructive" });
      return;
    }
    
    const emptyQuestions = questions.filter(q => !q.question.trim());
    if (emptyQuestions.length > 0) {
      toast({ title: "Bütün sualları doldurun", variant: "destructive" });
      return;
    }

    const emptyOptions = questions.filter(q => 
      (q.type === "single" || q.type === "multiple") && 
      q.options?.some(o => !o.trim())
    );
    if (emptyOptions.length > 0) {
      toast({ title: "Bütün seçimləri doldurun", variant: "destructive" });
      return;
    }

    // Create survey (mock)
    toast({ 
      title: "Sorğu yaradıldı!", 
      description: "Sorğunuz müştərilərə göstəriləcək" 
    });
    navigate('/surveys');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate('/surveys')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Geri
        </Button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-foreground mb-2">
            Yeni Sorğu Yarat
          </h1>
          <p className="text-muted-foreground">
            Müştərilərinizin fikrini öyrənmək üçün sorğu yaradın
          </p>
        </div>

        {/* Survey Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sorğu Məlumatları</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Sorğu başlığı *</Label>
              <Input
                id="title"
                placeholder="Məs: Müştəri Məmnuniyyəti Sorğusu"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Təsvir *</Label>
              <Textarea
                id="description"
                placeholder="Sorğunun məqsədi və təxmini vaxtı haqqında məlumat..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reward">Mükafat (istəyə bağlı)</Label>
                <Input
                  id="reward"
                  placeholder="Məs: 10 AZN bonus"
                  value={reward}
                  onChange={(e) => setReward(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expires">Bitmə tarixi *</Label>
                <Input
                  id="expires"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Questions */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Suallar</h2>
            <Button variant="outline" size="sm" onClick={addQuestion}>
              <Plus className="w-4 h-4 mr-2" />
              Sual əlavə et
            </Button>
          </div>

          {questions.map((question, qIndex) => (
            <Card key={question.id}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/10 text-primary rounded-full flex items-center justify-center text-sm font-bold">
                    {qIndex + 1}
                  </div>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <Input
                          placeholder="Sualınızı yazın..."
                          value={question.question}
                          onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                        />
                      </div>
                      <Select
                        value={question.type}
                        onValueChange={(value) => updateQuestion(qIndex, "type", value)}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {questionTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Options for single/multiple choice */}
                    {(question.type === "single" || question.type === "multiple") && (
                      <div className="space-y-2 pl-4 border-l-2 border-border">
                        <Label className="text-sm text-muted-foreground">Seçimlər</Label>
                        {question.options?.map((option, oIndex) => (
                          <div key={oIndex} className="flex items-center gap-2">
                            <GripVertical className="w-4 h-4 text-muted-foreground" />
                            <Input
                              placeholder={`Seçim ${oIndex + 1}`}
                              value={option}
                              onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                              className="flex-1"
                            />
                            {question.options!.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => removeOption(qIndex, oIndex)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        ))}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground"
                          onClick={() => addOption(qIndex)}
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Seçim əlavə et
                        </Button>
                      </div>
                    )}

                    {question.type === "rating" && (
                      <p className="text-sm text-muted-foreground pl-4">
                        İstifadəçi 1-5 ulduz seçəcək
                      </p>
                    )}

                    {question.type === "text" && (
                      <p className="text-sm text-muted-foreground pl-4">
                        İstifadəçi sərbəst cavab yazacaq
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(qIndex)}
                    disabled={questions.length === 1}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => navigate('/surveys')}>
            Ləğv et
          </Button>
          <Button variant="gold" onClick={handleSubmit}>
            Sorğunu yarat
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CreateSurveyPage;
