-- Permite todas las operaciones de CRUD para la tabla vendedores en entorno de desarrollo.
CREATE POLICY "Acceso total a vendedores en Desarrollo" ON "public"."vendedores" FOR ALL USING (true);
