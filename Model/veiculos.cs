using System.Security.Policy;

namespace MobilizaAPI.Model
{
    public class veiculos
    {
        public int id {  get; set; }
        public string placa { get; set; }
        public int tipo_veiculo_id { get; set; }
        public int usuario_id { get; set; }
        public int status_id { get; set; }
        public string? foto { get; set; }
    }
}
