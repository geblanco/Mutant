#include <iostream>
#include <fstream>
#include <string.h>
#include <stdlib.h>
#include <stddef.h>
#include <gio/gio.h>
#include <gtk/gtk.h>
#include <unistd.h>
#include <stdio.h> //FILENAME_MAX
#include <vector>
#include "json.hpp"

const char* name_key = "name\0";
const char* exec_key = "exec\0";
const char* subt_key = "text\0";
const gchar* icon_key = "icon\0";
const char* no_resource  = "__unknown__\0";

using json = nlohmann::json;
using namespace std;

/**
 * GTK_ICON_LOOKUP_FORCE_SIZE -> 16
 * GTK_ICON_LOOKUP_USE_BUILTIN -> 4
 * GTK_ICON_LOOKUP_NO_SVG -> 1
 */

// Taken from http://creativeandcritical.net/str-replace-c
char *repl_str(const char *str, const char *from, const char *to)
{

    /* Adjust each of the below values to suit your needs. */

    /* Increment positions cache size initially by this number. */
    size_t cache_sz_inc = 16;
    /* Thereafter, each time capacity needs to be increased,
     * multiply the increment by this factor. */
    const size_t cache_sz_inc_factor = 3;
    /* But never increment capacity by more than this number. */
    const size_t cache_sz_inc_max = 1048576;

    char *pret, *ret = NULL;
    const char *pstr2, *pstr = str;
    size_t i, count = 0;
    ptrdiff_t *pos_cache = NULL;
    size_t cache_sz = 0;
    size_t cpylen, orglen, retlen, tolen, fromlen = strlen(from);

    /* Find all matches and cache their positions. */
    while ((pstr2 = strstr(pstr, from)) != NULL) {
        count++;

        /* Increase the cache size when necessary. */
        if (cache_sz < count) {
            cache_sz += cache_sz_inc;
            pos_cache = (ptrdiff_t *)realloc(pos_cache, sizeof(*pos_cache) * cache_sz);
            if (pos_cache == NULL) {
                goto end_repl_str;
            }
            cache_sz_inc *= cache_sz_inc_factor;
            if (cache_sz_inc > cache_sz_inc_max) {
                cache_sz_inc = cache_sz_inc_max;
            }
        }

        pos_cache[count-1] = pstr2 - str;
        pstr = pstr2 + fromlen;
    }

    orglen = pstr - str + strlen(pstr);

    /* Allocate memory for the post-replacement string. */
    if (count > 0) {
        tolen = strlen(to);
        retlen = orglen + (tolen - fromlen) * count;
    } else  retlen = orglen;
    ret = (char *)malloc(retlen + 1);
    if (ret == NULL) {
        goto end_repl_str;
    }

    if (count == 0) {
        /* If no matches, then just duplicate the string. */
        strcpy(ret, str);
    } else {
        /* Otherwise, duplicate the string whilst performing
         * the replacements using the position cache. */
        pret = ret;
        memcpy(pret, str, pos_cache[0]);
        pret += pos_cache[0];
        for (i = 0; i < count; i++) {
            memcpy(pret, to, tolen);
            pret += tolen;
            pstr = str + pos_cache[i] + fromlen;
            cpylen = (i == count-1 ? orglen : pos_cache[i+1]) - pos_cache[i] - fromlen;
            memcpy(pret, pstr, cpylen);
            pret += cpylen;
        }
        ret[retlen] = '\0';
    }

    end_repl_str:
        /* Free the cache and return the post-replacement string,
         * which will be NULL in the event of an error. */
        free(pos_cache);
        return ret;
}

int main(int argc, char const *argv[])
{
    int exitCode = 0;
    ofstream f( argv[1], ios::out );
    json JSON = json::array();
    json aux  = json::object();
    if ( !f.is_open() ){
        cout<<"[LIST APPS] Unable to open output file"<<endl;
        exitCode = 1;
        char cCurrentPath[FILENAME_MAX];
        if( getcwd(cCurrentPath, sizeof(cCurrentPath)) ){
            cout<<"[LIST APPS] cwd: "<<cCurrentPath<<endl;
        }
    }else{
        cout<<"[LIST APPS] Working on file "<<argv[1];
        const char * theme = argc > 2 ? argv[2] : NULL;
        GtkIconLookupFlags defaultOpt = GTK_ICON_LOOKUP_FORCE_SIZE;
        if( argc > 3 ){
            defaultOpt = (GtkIconLookupFlags)atoi( argv[3] );
        }
        GList* apps = g_app_info_get_all();
        GtkIconTheme* icon_theme;
        if( theme == NULL ){
            icon_theme = gtk_icon_theme_get_for_screen( gdk_screen_get_default() );   
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
                    GtkIconInfo* icon_info = gtk_icon_theme_lookup_by_gicon( icon_theme, icon, 48, 
                        defaultOpt );
                        //GTK_ICON_LOOKUP_FORCE_SIZE );
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
                aux[ name_key ] = repl_str(display_name, "\"", "");
                aux[ exec_key ] = repl_str(executable_name, "\"", "");
                aux[ subt_key ] = repl_str(description, "\"", "");
                aux[ icon_key ] = repl_str(icon_str?icon_str:no_resource, "\"", "");
                JSON.push_back( aux );

                apps = apps->next;
            }catch (...){ apps = apps->next; continue; }
        }
        f<<JSON.dump( 4 )<<endl;
        f.close();
    }
    if( exitCode ){
        cout<<"Usage: "<<argv[0]<<" <file_path> [theme] [search_flag]"<<endl;
    }
    return exitCode;
}