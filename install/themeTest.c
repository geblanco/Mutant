#include <gtk/gtk.h>

int main(int argc, char const *argv[])
{
    GtkIconTheme* icon_theme;
    icon_theme = gtk_icon_theme_get_default();   

    if( icon_theme == NULL ){
        // No default icon, user action needed
        return 1;
    }else{
        // Save args null
        return 0;
    }
}