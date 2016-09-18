#include <iostream>
#include <string.h>
#include <gio/gio.h>
#include <gtk/gtk.h>
#include <vector>

const char* name_key = "appName\0";
const char* exec_key = "appCmd\0";
const char* subt_key = "subText\0";
const gchar* icon_key = "iconPath\0";

const char* no_resource  = "__unknown__\0";

typedef std::pair<
    std::pair< const char*, const char* >,
    std::pair< const char*, const gchar* >
> qpair;
typedef std::vector<qpair> Queue;

void searchApp(Queue& queue, const char* theme)
{
    GList* apps = g_app_info_get_all();
    GtkIconTheme* icon_theme;
    if( theme == NULL ){
        icon_theme = gtk_icon_theme_get_default();   
    }else{
        icon_theme = gtk_icon_theme_new();
        gtk_icon_theme_set_custom_theme( icon_theme, theme );
    }
    GError* err = 0;
    
    while (apps->next != NULL)
    {
        try {
            // Get display name and executable name
            const char* display_name = g_app_info_get_display_name( (GAppInfo*) (apps->data) );
            const char* executable_name = g_app_info_get_executable( (GAppInfo*) (apps->data) );
            const char* description = g_app_info_get_description( (GAppInfo*) (apps->data) );

            // Get the icon
            GIcon* icon = g_app_info_get_icon((GAppInfo*)(apps->data));
            gchar* icon_str = NULL;
            if( icon != NULL ){
                // For some reason, svg images from themes do not render the same on the OS and the browser, 
                // icons get rendered just as plain colors, avoid this allowing only non-svg images
                GtkIconInfo* icon_info = gtk_icon_theme_lookup_by_gicon( icon_theme, icon, 256, GTK_ICON_LOOKUP_FORCE_SIZE );
                    //GTK_ICON_LOOKUP_USE_BUILTIN );
                    //GTK_ICON_LOOKUP_NO_SVG );
                if( icon_info != NULL ){
                    // Get path
                    icon_str = const_cast<gchar*>(gtk_icon_info_get_filename( icon_info ));
                }
            }
            display_name    = display_name    == NULL ? no_resource : display_name;
            executable_name = executable_name == NULL ? no_resource : executable_name;
            description     = description     == NULL ? no_resource : description;
            // Push to vector
            queue.push_back( 
                std::make_pair( 
                    std::make_pair( display_name, executable_name ),
                    std::make_pair( description, icon_str? icon_str : no_resource )
                )
            );
            apps = apps->next;
        }
        catch (...){ apps = apps->next; continue; }
    }
}

int main(int argc, char const *argv[])
{
    Queue queue;
    FILE* f;
    int exitCode = 0;
    printf("Working on file %s\n", argv[1]);
    if (!(f = fopen(argv[1], "w"))){
        std::cout<<"Unable to open output file"<<std::endl;
        exitCode = 1;
    }else{
        searchApp(queue, argc > 2 ? argv[2] : NULL);
        std::vector<qpair>::iterator it;
        fprintf(f, "[");
        int i = 0;
        for( it = queue.begin(); it != queue.end(); ++it, i++ ){
            std::pair< const char*, const char* > names = ((*it).first);
            std::pair< const char*, const char* > descr  = ((*it).second);
            // Hotfix for bad scaped app sequences, should not happen
            //  but for some reason, eventually a path can contain "", 
            //  by now, instead of parsing it, just drop
            if(
                strstr( names.first, "\"" ) == NULL &&
                strstr( names.second, "\"") == NULL &&
                strstr( descr.first, "\"" ) == NULL &&
                strstr( descr.second, "\"") == NULL
            ){
                fprintf(f, "{\n\t\"%s\": \"%s\",",name_key, names.first);
                fprintf(f, "\n\t\"%s\": \"%s\",", exec_key, names.second);
                fprintf(f, "\n\t\"%s\": \"%s\",", subt_key, descr.first);
                // Fix endind comma
                if( i < queue.size()-1 ){
                    fprintf(f, "\n\t\"%s\": \"%s\"\n},", icon_key, descr.second);
                }else{
                    fprintf(f, "\n\t\"%s\": \"%s\"\n}", icon_key, descr.second);
                }
            }else{
                std::cout<<"Found bad app, skipping "<<names.second<<std::endl;
            }
        }
        fprintf(f, "]\n");
        fclose(f);
    }
    return exitCode;
}