<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use OpenApi\Analysers\AttributeAnnotationFactory;
use OpenApi\Analysers\DocBlockAnnotationFactory;
use OpenApi\Analysers\ReflectionAnalyser;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // l5-swagger 11 solo lee atributos PHP 8 por defecto; este analizador
        // tambien lee los docblocks @OA. Se define aqui (no en config/) para
        // que `config:cache` no tenga que serializar un objeto.
        if (class_exists(ReflectionAnalyser::class)) {
            config(['l5-swagger.defaults.scanOptions.analyser' => new ReflectionAnalyser([
                new DocBlockAnnotationFactory(),
                new AttributeAnnotationFactory(),
            ])]);
        }
    }
}
