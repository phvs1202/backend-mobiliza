using System.Data;

namespace MobilizaAPI.Model
{
    public class entrada
    {
        public int id {  get; set; }
        public DateTime hora { get; set; }
        public int usuarios_id { get; set; }
        public string? motivo_entrada { get; set; }
        public int veiculo_id { get; set; }
        public int status_id { get; set; }
    }
}
