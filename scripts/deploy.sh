#!/bin/bash

# Script de déploiement pour l'application météo

set -e

echo "🚀 Démarrage du déploiement..."

# Variables
APP_NAME="meteo-app"
DOCKER_IMAGE="meteo-app:latest"
CONTAINER_NAME="meteo-app-container"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Vérifier que docker-compose est installé
if ! command -v docker-compose &> /dev/null; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

# Construire l'image Docker
log_info "Construction de l'image Docker..."
docker build -t $DOCKER_IMAGE .

# Arrêter et supprimer le conteneur existant s'il existe
if docker ps -a | grep -q $CONTAINER_NAME; then
    log_info "Arrêt du conteneur existant..."
    docker stop $CONTAINER_NAME
    docker rm $CONTAINER_NAME
fi

# Démarrer le nouveau conteneur
log_info "Démarrage du nouveau conteneur..."
docker run -d \
    --name $CONTAINER_NAME \
    -p 80:80 \
    --restart unless-stopped \
    $DOCKER_IMAGE

# Vérifier que le conteneur fonctionne
sleep 5
if docker ps | grep -q $CONTAINER_NAME; then
    log_info "✅ Déploiement réussi !"
    log_info "L'application est accessible sur http://localhost"
else
    log_error "❌ Le déploiement a échoué"
    docker logs $CONTAINER_NAME
    exit 1
fi

# Afficher les informations du conteneur
log_info "Informations du conteneur :"
docker ps | grep $CONTAINER_NAME

echo ""
log_info "🎉 Déploiement terminé avec succès !"
