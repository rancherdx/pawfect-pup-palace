import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { Palette, Calendar, Settings, Sparkles } from "lucide-react";

const holidays = [
  { value: "none", label: "No Holiday Theme", icon: "🏠" },
  { value: "halloween", label: "Halloween", icon: "🎃" },
  { value: "christmas", label: "Christmas", icon: "🎄" },
  { value: "valentine", label: "Valentine's Day", icon: "💝" },
];

const HolidayThemeManager = () => {
  const { theme, setTheme, holiday, setHoliday, holidayEnabled, setHolidayEnabled } = useTheme();

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3"
      >
        <div className="p-2 bg-primary/20 rounded-lg">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-semibold">Holiday Theme Manager</h2>
          <p className="text-muted-foreground font-body">Control the appearance and seasonal themes of your site</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Base Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Base Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Theme Mode</Label>
              <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">☀️ Light</SelectItem>
                  <SelectItem value="dark">🌙 Dark</SelectItem>
                  <SelectItem value="system">🖥️ System</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="p-4 rounded-lg bg-muted/50">
              <p className="text-sm text-muted-foreground">
                The base theme controls the overall appearance. Holiday themes will override this when enabled.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Holiday Theme Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Holiday Themes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Enable Holiday Themes</Label>
                <p className="text-sm text-muted-foreground">Allow seasonal themes to override base theme</p>
              </div>
              <Switch 
                checked={holidayEnabled}
                onCheckedChange={setHolidayEnabled}
              />
            </div>

            {holidayEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-3"
              >
                <Label>Active Holiday Theme</Label>
                <Select value={holiday} onValueChange={setHoliday}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {holidays.map((h) => (
                      <SelectItem key={h.value} value={h.value}>
                        <span className="flex items-center gap-2">
                          <span>{h.icon}</span>
                          {h.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Theme Preview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Sample Cards showing current theme */}
            <motion.div
              className="p-4 rounded-lg bg-primary/10 border border-primary/20"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-medium">Primary Color</span>
              </div>
              <p className="text-sm text-muted-foreground">This shows your primary theme color</p>
            </motion.div>

            <motion.div
              className="p-4 rounded-lg bg-secondary/50 border border-secondary"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-secondary-foreground"></div>
                <span className="font-medium">Secondary Color</span>
              </div>
              <p className="text-sm text-muted-foreground">Secondary theme elements</p>
            </motion.div>

            <motion.div
              className="p-4 rounded-lg bg-accent/50 border border-accent"
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-accent-foreground"></div>
                <span className="font-medium">Accent Color</span>
              </div>
              <p className="text-sm text-muted-foreground">Accent and highlight colors</p>
            </motion.div>
          </div>

          <div className="mt-6 p-4 rounded-lg bg-muted/50">
            <h4 className="font-medium mb-2">Current Settings:</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p>Base Theme: <span className="font-medium capitalize">{theme}</span></p>
              <p>Holiday Themes: <span className="font-medium">{holidayEnabled ? 'Enabled' : 'Disabled'}</span></p>
              {holidayEnabled && (
                <p>Active Holiday: <span className="font-medium capitalize">{holiday}</span></p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <motion.div
        className="flex justify-end"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <Button size="lg" className="font-medium">
          <Sparkles className="h-4 w-4 mr-2" />
          Apply Changes
        </Button>
      </motion.div>
    </div>
  );
};

export default HolidayThemeManager;