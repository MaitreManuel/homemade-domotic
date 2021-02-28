.DEFAULT_GOAL := help

NPM= npm run

build: ## Compile les fichiers front CSS, JS et autre assets dans le dossier html/dist/ pour la MEP
	@$(NPM) build

clean: ## Supprime les dépendances et les fichiers parasites
	@$(NPM) clean

dev: ## Compile les fichiers front CSS, JS et autre assets dans le dossier html/dist/
	@$(NPM) build:dev

install: ## Installe les dépendances
	@npm install

lint: ## Affiche les erreurs de syntaxe JS
	@$(NPM) lint

lint-fix: ## Affiche et corrige les erreurs de syntaxe JS
	@$(NPM) lint:fix

pre-commit: ## Execute le script de pre-commit
	@sh _hooks/pre-commit

stats: ## Affiche la taille des librairies utilisées
	@$(NPM) stats
	@$(NPM) stats:show

watch: ## Compile les fichiers front CSS, JS et autre assets dans le dossier html/dist/ à chaque modification
	@$(NPM) build:watch

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'
