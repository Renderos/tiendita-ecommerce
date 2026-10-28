<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // La base de datos de Neon ya incluye categorias, marcas, productos y cupones.
        // No se siembra nada desde Laravel para no duplicar ni sobrescribir los datos del equipo.
    }
}
