namespace MobilizaAPI.Model
{
    public class usuarios
    {
        public int id { get; set; }
        public string? nome { get; set; }
        public string? email { get; set; }
        public string? senha { get; set; }
        public string? foto_de_perfil { get; set; }
        public int tipo_usuario_id { get; set; }
        public int? curso_id { get; set; }
        public int status_id { get; set; }
    }
}
