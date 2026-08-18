<?php

namespace Database\Seeders;

use App\Models\Proveedor;
use Illuminate\Database\Seeder;

class ProveedorSeeder extends Seeder
{
    public function run(): void
    {
        $proveedores = [
            [
                'nombre' => 'Distribuidora El Ahorro',
                'contacto' => 'Carlos Mendoza',
                'telefono' => '0991234567',
                'email' => 'carlos@elahorro.com',
            ],
            [
                'nombre' => 'Comercial La Favorita',
                'contacto' => 'María González',
                'telefono' => '0982345678',
                'email' => 'maria@lafavorita.com',
            ],
            [
                'nombre' => 'Productos Andinos',
                'contacto' => 'Jorge Ramírez',
                'telefono' => '0973456789',
                'email' => 'jorge@productosandinos.com',
            ],
            [
                'nombre' => 'Distribuciones El Valle',
                'contacto' => 'Ana Torres',
                'telefono' => '0964567890',
                'email' => 'ana@elvalle.com',
            ],
            [
                'nombre' => 'Comercial San Sebastián',
                'contacto' => 'Luis Cárdenas',
                'telefono' => '0955678901',
                'email' => 'luis@sansebastian.com',
            ],
            [
                'nombre' => 'Alimentos La Sierra',
                'contacto' => 'Patricia León',
                'telefono' => '0946789012',
                'email' => 'patricia@alimentosierra.com',
            ],
            [
                'nombre' => 'Importadora El Sol',
                'contacto' => 'Fernando Molina',
                'telefono' => '0937890123',
                'email' => 'fernando@elsol.com',
            ],
            [
                'nombre' => 'Distribuidora Los Andes',
                'contacto' => 'Sofía Castillo',
                'telefono' => '0928901234',
                'email' => 'sofia@losandes.com',
            ],
            [
                'nombre' => 'Comercial Nueva Era',
                'contacto' => 'Diego Herrera',
                'telefono' => '0919012345',
                'email' => 'diego@nuevaera.com',
            ],
            [
                'nombre' => 'Proveedora Santa Rosa',
                'contacto' => 'Gabriela Paredes',
                'telefono' => '0900123456',
                'email' => 'gabriela@santarosa.com',
            ],
            [
                'nombre' => 'Mercantil del Austro',
                'contacto' => 'Andrés Vázquez',
                'telefono' => '0992345678',
                'email' => 'andres@mercantilaustro.com',
            ],
            [
                'nombre' => 'Distribuciones Cuenca',
                'contacto' => 'Verónica Ortiz',
                'telefono' => '0983456789',
                'email' => 'veronica@distribucionescuenca.com',
            ],
            [
                'nombre' => 'Comercial El Portal',
                'contacto' => 'Ricardo Flores',
                'telefono' => '0974567890',
                'email' => 'ricardo@elportal.com',
            ],
            [
                'nombre' => 'Proveedora San José',
                'contacto' => 'Claudia Ruiz',
                'telefono' => '0965678901',
                'email' => 'claudia@sanjose.com',
            ],
            [
                'nombre' => 'Alimentos del Ecuador',
                'contacto' => 'Mauricio Silva',
                'telefono' => '0956789012',
                'email' => 'mauricio@alimentos.ec',
            ],
            [
                'nombre' => 'Comercial El Granero',
                'contacto' => 'Daniela Cabrera',
                'telefono' => '0947890123',
                'email' => 'daniela@elgranero.com',
            ],
            [
                'nombre' => 'Distribuidora La Unión',
                'contacto' => 'Esteban Muñoz',
                'telefono' => '0938901234',
                'email' => 'esteban@launion.com',
            ],
            [
                'nombre' => 'Productos del Valle',
                'contacto' => 'Natalia Jiménez',
                'telefono' => '0929012345',
                'email' => 'natalia@productosvalle.com',
            ],
            [
                'nombre' => 'Comercial El Molino',
                'contacto' => 'Pablo Andrade',
                'telefono' => '0910123456',
                'email' => 'pablo@elmolino.com',
            ],
            [
                'nombre' => 'Distribuidora La Colmena',
                'contacto' => 'Lorena Espinoza',
                'telefono' => '0901234567',
                'email' => 'lorena@lacolmena.com',
            ],
            [
                'nombre' => 'Importadora Continental',
                'contacto' => 'Santiago Mora',
                'telefono' => '0993456789',
                'email' => 'santiago@continental.com',
            ],
            [
                'nombre' => 'Proveedora El Carmen',
                'contacto' => 'Elena Méndez',
                'telefono' => '0984567890',
                'email' => 'elena@elcarmen.com',
            ],
            [
                'nombre' => 'Distribuciones La Esperanza',
                'contacto' => 'Cristian Rojas',
                'telefono' => '0975678901',
                'email' => 'cristian@laesperanza.com',
            ],
            [
                'nombre' => 'Comercial San Francisco',
                'contacto' => 'Mónica Bravo',
                'telefono' => '0966789012',
                'email' => 'monica@sanfrancisco.com',
            ],
            [
                'nombre' => 'Alimentos Naturales EC',
                'contacto' => 'Álvaro Peña',
                'telefono' => '0957890123',
                'email' => 'alvaro@naturales.ec',
            ],
            [
                'nombre' => 'Distribuidora El Progreso',
                'contacto' => 'Silvia Guerrero',
                'telefono' => '0948901234',
                'email' => 'silvia@elprogreso.com',
            ],
            [
                'nombre' => 'Comercial Los Cedros',
                'contacto' => 'Héctor Salazar',
                'telefono' => '0939012345',
                'email' => 'hector@loscedros.com',
            ],
            [
                'nombre' => 'Proveedora La Merced',
                'contacto' => 'Rosa Villavicencio',
                'telefono' => '0920123456',
                'email' => 'rosa@lamerced.com',
            ],
            [
                'nombre' => 'Distribuidora El Mirador',
                'contacto' => 'Juan Campoverde',
                'telefono' => '0911234567',
                'email' => 'juan@elmirador.com',
            ],
            [
                'nombre' => 'Comercial Cabaña Fresh',
                'contacto' => 'Miguel Conforme',
                'telefono' => '0902345678',
                'email' => 'miguel@cabanfresh.com',
            ],
        ];

        foreach ($proveedores as $proveedor) {
            Proveedor::create($proveedor);
        }
    }
}
