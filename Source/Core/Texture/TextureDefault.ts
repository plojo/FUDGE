namespace FudgeCore {
  export class TextureDefault extends TextureBase64 {
    public static color: TextureBase64 = new TextureDefault("TextureDefault", TextureDefault.getColor(), MIPMAP.MEDIUM);
    public static normal: TextureBase64 = new TextureDefault("TextureNormalDefault", TextureDefault.getNormal(), MIPMAP.MEDIUM);

    // TODO: maybe make these lazy
    public static iconLight: TextureBase64 = new TextureDefault("IconDefaultLight", TextureDefault.getIconLight(), MIPMAP.BLURRY, WRAP.CLAMP, 256, 256);
    public static iconCamera: TextureBase64 = new TextureDefault("IconDefaultCamera", TextureDefault.getIconCamera(), MIPMAP.BLURRY, WRAP.CLAMP, 256, 256);
    public static iconAudio: TextureBase64 = new TextureDefault("IconDefaultAudio", TextureDefault.getIconAudio(), MIPMAP.BLURRY, WRAP.CLAMP, 256, 256);
    // public static iconParticles: TextureBase64 = new TextureDefault("IconDefaultParticle", TextureDefault.getIconParticles(), MIPMAP.BLURRY, 256, 256);

    private static getColor(): string {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQCAYAAACAvzbMAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAADWLSURBVHhe7d0HnFTlvf/xH9uXZYGl9yrSRJpEUexYsJIba8Re498WNcZEb+41epOIsWs0Niyxm2g0duwaewO7oqJCAGnSt7H/8304B4dldpk5Z3b3zO7nzeu85pwzM8vMs7PPb35PO61qPBZjrVq18vfiKebFR/lFRPlFQ/lFE/fyy/FvAQBICwEEABAKAQQAEAp9IBHRhhoN5RcN5RdNSyg//YzCwkJr3bq1O169erXbMoEAEhF/wNFQftFQftE09/LLzc21Ll262E9+8hMbP368VVdX2+uvv27Tp093QSTq+yeARMQfcDSUXzSUXzTNtfxycnKspKTEBg0aZEceeaQdeuihtmLFCvvss89s3rx59vjjj9vDDz8cOROJHECqqqps9uzZtmzZMlu5cqVLldq1a2d9+/Z1+1HxAYyG8ouG8ouG8osmTPnl5+db9+7dbffdd7dTTz3V1cXvvvuuvfzyyy4DkVWrVtmNN95oS5YsccdhhQ4g5eXl9uyzz9qMGTNszZo1/tkfKQIq+u29995WWlrqn00fH8BoKL9oKL9oKL9o0ik/PbZNmza2xRZb2HHHHWeTJ0+2hQsX2pNPPmmLFy/2H7XOf/7zH7v11ltdPR5FqACyYMECu+eee1KKXmvXrrX99tvPRo8e7YJKuvgARkP5RROUnz67+iKUl5dnlZWVtnz58li8dj5/0TSn8lOT1b777msXXHCBde7c2V577TV78803k77Hb7/91u644w6rqKjwz4STdgBRtqHUJ4hoChCffPKJffXVV649rX379jZgwAC3BZQuTZo0ybbbbjuXXqWDD2A0lF80Qfl17NjRjjnmGOvUqZN988039sADD7gvUk39+vn8RdOcyq9r1642depU23rrre3RRx91X3JEdbSasIqLi23YsGHuXKYCSNopgXrvg+Ch/o/77rvPvVi9+J///Od29NFH29ChQ90LDGj4mNIlBZm4/8LQssycOdM1xb766qtJm2JF2UfPnj3t17/+tU2YMMF23XVXO/bYY11QQfM1f/58u+mmm1zfgfp44071sV6zPstB8FA9rC/8Tz31lOsXybS0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";
    }

    private static getNormal(): string {
      return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAIAAACQd1PeAAAFDmlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4KPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS41LjAiPgogPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4KICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIgogICAgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIgogICAgeG1sbnM6ZXhpZj0iaHR0cDovL25zLmFkb2JlLmNvbS9leGlmLzEuMC8iCiAgICB4bWxuczp0aWZmPSJodHRwOi8vbnMuYWRvYmUuY29tL3RpZmYvMS4wLyIKICAgIHhtbG5zOnhtcE1NPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvbW0vIgogICAgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIKICAgeG1wOkNyZWF0ZURhdGU9IjIwMjMtMDUtMDZUMjI6Mjg6MDYrMDIwMCIKICAgeG1wOk1vZGlmeURhdGU9IjIwMjMtMDUtMDZUMjI6MzA6MjErMDI6MDAiCiAgIHhtcDpNZXRhZGF0YURhdGU9IjIwMjMtMDUtMDZUMjI6MzA6MjErMDI6MDAiCiAgIHBob3Rvc2hvcDpEYXRlQ3JlYXRlZD0iMjAyMy0wNS0wNlQyMjoyODowNiswMjAwIgogICBwaG90b3Nob3A6Q29sb3JNb2RlPSIzIgogICBwaG90b3Nob3A6SUNDUHJvZmlsZT0ic1JHQiBJRUM2MTk2Ni0yLjEiCiAgIGV4aWY6UGl4ZWxYRGltZW5zaW9uPSIxIgogICBleGlmOlBpeGVsWURpbWVuc2lvbj0iMSIKICAgZXhpZjpDb2xvclNwYWNlPSIxIgogICB0aWZmOkltYWdlV2lkdGg9IjEiCiAgIHRpZmY6SW1hZ2VMZW5ndGg9IjEiCiAgIHRpZmY6UmVzb2x1dGlvblVuaXQ9IjIiCiAgIHRpZmY6WFJlc29sdXRpb249IjcyLzEiCiAgIHRpZmY6WVJlc29sdXRpb249IjcyLzEiPgogICA8eG1wTU06SGlzdG9yeT4KICAgIDxyZGY6U2VxPgogICAgIDxyZGY6bGkKICAgICAgc3RFdnQ6YWN0aW9uPSJwcm9kdWNlZCIKICAgICAgc3RFdnQ6c29mdHdhcmVBZ2VudD0iQWZmaW5pdHkgUGhvdG8gMiAyLjAuNCIKICAgICAgc3RFdnQ6d2hlbj0iMjAyMy0wNS0wNlQyMjozMDoyMSswMjowMCIvPgogICAgPC9yZGY6U2VxPgogICA8L3htcE1NOkhpc3Rvcnk+CiAgPC9yZGY6RGVzY3JpcHRpb24+CiA8L3JkZjpSREY+CjwveDp4bXBtZXRhPgo8P3hwYWNrZXQgZW5kPSJyIj8+0IgVxAAAAYBpQ0NQc1JHQiBJRUM2MTk2Ni0yLjEAACiRdZHPK0RRFMc/M37mR6NYKBYvDauhQYmNxcivwmKMMtjMvPml5o3Xe2/SZKtsFSU2fi34C9gqa6WIlGxZExv0nOepkcy5nXs+93vvOd17LngjWVUzy4Og5SwjPBpSZqNzStUjFVTSRAu+mGrqk9MjEUra2w0eJ151OrVKn/vXahNJUwVPtfCgqhuW8JjwxLKlO7wp3KRmYgnhY+GAIRcUvnb0uMtPDqdd/nDYiISHwNsgrKR/cfwXqxlDE5aX49eyefXnPs5L6pK5mWmJbeKtmIQZJYTCOMMM0Uc3AzL30UkPXbKiRH7wO3+KJclVZdYpYLBImgwWAVHzUj0pMSV6UkaWgtP/v301U709bvW6EFQ82PZLO1RtwOe6bb/v2/bnAZTdw1mumL+0B/2voq8XNf8u+Fbh5LyoxbfgdA2a7/SYEfuWysS9qRQ8H0F9FBovoWbe7dnPPoe3EFmRr7qA7R3okPO+hS824WfQgxGCcgAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxJREFUCJljaGj4DwADgwIAVbjWPwAAAABJRU5ErkJggg==";
    }

    private static getIconLight(): string {
      return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg viewBox='0 0 16 16' version='1.1' width='16' height='16' id='Light' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E .s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Crect class='s' x='0.17039293' y='10.002448' width='3.9000568' height='0.90009934' id='NNE' transform='rotate(-67.5)' /%3E%3Crect x='8.8295078' y='10.002447' width='3.9000568' height='0.90009934' id='ENE' transform='rotate(-22.5)' class='s' /%3E%3Crect x='14.952469' y='3.8795717' width='3.9000139' height='0.90009987' id='ESE' transform='rotate(22.5)' class='s' /%3E%3Crect x='14.95247' y='-4.7795429' width='3.9000139' height='0.90009987' id='SSE' transform='rotate(67.5)' class='s' /%3E%3Crect x='-12.729565' y='10.002447' width='3.9000139' height='0.90009987' id='SSW' transform='rotate(-67.5)' class='s' /%3E%3Crect x='-4.0704498' y='10.002447' width='3.9000139' height='0.90009987' id='WSW' transform='rotate(-22.5)' class='s' /%3E%3Crect x='2.0524685' y='3.8795717' width='3.9000139' height='0.90009987' id='WNW' transform='rotate(22.5)' class='s' /%3E%3Crect x='2.0524685' y='-4.7795429' width='3.9000139' height='0.90009987' id='NNW' transform='rotate(67.5)' class='s' /%3E%3Cellipse id='CENTER' cx='8.000082' cy='8.0002575' rx='3.4500823' ry='3.4502573' class='s' /%3E%3C/svg%3E";
    }

    private static getIconCamera(): string {
      return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg id='Camera' viewBox='0 0 16 16' version='1.1' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle id='style1'%3E.s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Cpath class='s' d='M 13.857322,8.8755297 H 12.413424 L 12.413,6.787 h -1.425311 c 0.227026,-0.4494693 0.363243,-0.9453919 0.363243,-1.4885008 0,-1.7978775 -1.4075727,-3.2492893 -3.1511466,-3.2492893 -1.7435746,0 -3.1511479,1.4514118 -3.1511479,3.2492893 v 0.028093 C 4.5764194,5.0363118 4.0315524,4.8583968 3.4503606,4.8583968 1.7067863,4.8677567 0.29921298,6.3191723 0.29921298,8.107686 c 0,1.7885135 1.66538582,3.311789 3.42458512,3.249289 L 3.732,13.976 h 8.681 v -2.113368 h 1.444322 z' id='path1' /%3E%3Crect class='s' x='12.80391' y='8.3979683' width='2.8968766' height='3.8860376' rx='0' ry='0' id='rect1' /%3E%3C/svg%3E%0A";
    }

    private static getIconAudio(): string {
      return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8' standalone='no'%3F%3E%3Csvg id='Audio' viewBox='0 0 16 16' version='1.1' width='16' height='16' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E.s%7Bfill:%23fff;stroke:%23000;stroke-width:.1px;%7D %3C/style%3E%3Cpath class='s' d='M 9.1563588,1.0804006 3.6729341,4.642017 H 0.54364971 v 6.784031 H 3.7590612 l 5.3972976,3.493776 z' id='path1' /%3E%3Cpath class='s' d='m 13.347518,13.676645 -0.765157,-0.563566 c 4.227485,-5.5605241 0.210418,-9.881202 0.03825,-10.0596648 l 0.698204,-0.6481019 c 0.04782,0.046964 4.75353,5.0627076 0.03825,11.2713327 z' id='path2' /%3E%3Cpath class='s' d='m 11.321868,11.79809 -0.822541,-0.479032 c 2.142434,-3.5786474 0.114773,-6.35891 0.02869,-6.4716232 l 0.765156,-0.5635666 c 0.105208,0.1408915 2.505883,3.3814001 0.02869,7.5048298 z' id='path3' /%3E%3C/svg%3E%0A";
    }

    // private static getIconParticles(): string {
    //   return "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='UTF-8'%3F%3E%3Csvg id='Partikel_V2' xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16.28 16.52'%3E%3Cdefs%3E%3Cstyle%3E.cls-1%7Bfill:%23fff;stroke:%23000;stroke-miterlimit:15.12;stroke-width:.25px;%7D%3C/style%3E%3C/defs%3E%3Ccircle class='cls-1' cx='4.72' cy='5.47' r='2.52'/%3E%3Ccircle class='cls-1' cx='11.26' cy='8.28' r='1.75'/%3E%3Ccircle class='cls-1' cx='5.95' cy='12.05' r='1.29'/%3E%3C/svg%3E";
    // }
  }
}