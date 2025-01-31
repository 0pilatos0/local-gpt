import * as React from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings as SettingsIcon, RefreshCw, Copy, Check } from "lucide-react";
import { Settings, AVAILABLE_MODELS } from "../types/settings";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, AlertDescription } from "@/components/ui/alert";

const formSchema = z.object({
  apiUrl: z.string().url({ message: "Please enter a valid URL" }),
  model: z.string().min(1, { message: "Please select a model" }),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  settings: Settings;
  onUpdate: (settings: Partial<Settings>) => void;
}

const COPY_COMMAND = {
  command: "OLLAMA_HOST=0.0.0.0 OLLAMA_ORIGINS=https://chat.paulvanderlei.com ollama serve",
  description: "Run this command to start Ollama with the correct configuration:",
};

export function SettingsDialog({ settings, onUpdate }: Props) {
  const [open, setOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: settings,
  });

  const onSubmit = (data: FormData) => {
    onUpdate(data);
    setOpen(false);
  };

  const copySnippet = React.useCallback(() => {
    navigator.clipboard.writeText(COPY_COMMAND.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[80vw]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>Configure your chat settings. Changes will be saved automatically.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="model">Model</Label>
            <Controller
              name="model"
              control={form.control}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {AVAILABLE_MODELS.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          {model.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              )}
            />
            {form.formState.errors.model && <p className="text-sm text-destructive">{form.formState.errors.model.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="apiUrl">API URL</Label>
            <Input {...form.register("apiUrl")} placeholder="Enter API URL" />
            {form.formState.errors.apiUrl && <p className="text-sm text-destructive">{form.formState.errors.apiUrl.message}</p>}
          </div>

          <div className="space-y-3">
            <Label>Server Configuration</Label>
            <Alert>
              <AlertDescription className="text-sm">{COPY_COMMAND.description}</AlertDescription>
            </Alert>
            <div className="relative">
              <pre className="p-3 bg-muted rounded-lg text-sm font-mono overflow-x-auto">{COPY_COMMAND.command}</pre>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute top-1.5 right-1.5 h-8 w-8 hover:bg-muted-foreground/10"
                onClick={copySnippet}
              >
                {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                <span className="sr-only">{copied ? "Copied" : "Copy command"}</span>
              </Button>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="secondary" onClick={() => form.reset()} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset
            </Button>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
