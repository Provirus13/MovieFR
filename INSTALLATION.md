# Guide d'Installation - MovieFR

## 📱 Installation sur Android

### Option 1 : Installation directe (Recommandé)

1. **Télécharger l'APK**
   - Allez sur [Releases](https://github.com/Provirus13/MovieFR/releases)
   - Téléchargez le fichier `moviefr_*.apk`

2. **Autoriser les sources inconnues** (si nécessaire)
   - Allez dans **Paramètres** → **Sécurité**
   - Activez **Sources inconnues** ou **Applications inconnues**
   - (Varie selon la version Android)

3. **Installer l'APK**
   - Ouvrez le fichier téléchargé
   - Appuyez sur **Installer**
   - Attendez la fin de l'installation

4. **Lancer l'app**
   - Appuyez sur **Ouvrir** ou
   - Trouvez MovieFR dans vos applications

### Option 2 : Installation via ADB (pour développeurs)

```bash
# Connectez votre appareil en USB (ou utilisez un émulateur)
adb devices

# Installez l'APK
adb install moviefr_1003-V3.0.2.apk

# Lancez l'app
adb shell am start -n com.moviefr/com.moviefr.MainActivity
```

## ✅ Vérification

Après installation, vous devriez pouvoir :
- ✓ Ouvrir l'application
- ✓ Voir le catalogue de films
- ✓ Rechercher des contenus
- ✓ Gérer vos favoris

## 🔧 Désinstallation

**Via les paramètres Android :**
1. Paramètres → Applications
2. Sélectionnez MovieFR
3. Appuyez sur Désinstaller

**Via ADB :**
```bash
adb uninstall com.moviefr
```

## ⚠️ Dépannage

### "L'installation a échoué"
- Vérifiez que vous avez au moins 50 MB d'espace libre
- Redémarrez votre appareil
- Essayez de télécharger à nouveau l'APK

### "Impossible de vérifier l'app"
- C'est normal pour les APK non signées officiellement
- Vous devez autoriser l'installation depuis "Sources inconnues"

### L'app plante au démarrage
- Assurez-vous d'avoir Android 8.0+ (API 26+)
- Videz le cache : Paramètres → Applications → MovieFR → Stockage → Vider le cache
- Réinstallez l'application

### Problème de connexion
- Vérifiez votre connexion Internet
- Essayez de redémarrer l'app
- Videz le cache de l'application

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les [Issues existantes](https://github.com/Provirus13/MovieFR/issues)
2. [Créez une nouvelle issue](https://github.com/Provirus13/MovieFR/issues/new)
3. Décrivez le problème, votre version Android, et le modèle de téléphone

---

Profitez de MovieFR ! 🎬
