using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;
using QRCoder;
using System.Text.Json;

namespace MobilizaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VeiculosController : ControllerBase
    {
        private readonly DBMobilizaContext _dbContext;

        public VeiculosController(DBMobilizaContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("TodosVeiculos")]
        public async Task<ActionResult<IEnumerable<veiculos>>> Get()
        {
            try
            {
                var veiculos = await _dbContext.veiculos.ToListAsync();
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpGet("VeiculoEspecifico/{id}")]
        public async Task<ActionResult<veiculos>> GetTipo(int id)
        {
            try
            {
                var veiculo = await _dbContext.veiculos.FirstOrDefaultAsync(i => i.id == id);
                return Ok(veiculo);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("CadastroVeiculo")]
        public async Task<IActionResult> Veiculos([FromBody] List<veiculos> veiculos)
        {
            try
            {
                foreach (var veiculo in veiculos)
                {
                    veiculo.status_id = 1;
                    _dbContext.veiculos.Add(veiculo);
                }
                await _dbContext.SaveChangesAsync();
                return Ok("Veículo(s) cadastrado(s) com sucesso!");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao cadastrar veículo.", erro = ex.Message });
            }
        }

        [HttpGet("VeiculoPorUsuario/{id}")]
        public async Task<ActionResult<IEnumerable<veiculos>>> GetVeiculos(int id)
        {
            try
            {
                var veiculos = await _dbContext.veiculos.Where(i => i.usuario_id == id).ToListAsync();
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("UploadFoto/{id}")]
        public async Task<IActionResult> UploadFoto(int id, IFormFile arquivo)
        {
            try
            {
                var veiculo = await _dbContext.veiculos.FindAsync(id);
                if (veiculo == null)
                    return NotFound("Veículo não encontrado.");
                if (arquivo == null || arquivo.Length == 0)
                    return BadRequest("Arquivo inválido.");

                using var ms = new MemoryStream();
                await arquivo.CopyToAsync(ms);
                veiculo.foto = ms.ToArray();

                _dbContext.Update(veiculo);
                await _dbContext.SaveChangesAsync();

                string fotoBase64 = Convert.ToBase64String(veiculo.foto);

                return Ok(new
                {
                    message = "Foto enviada com sucesso!",
                    arquivo = $"data:image/jpeg;base64,{fotoBase64}"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("RetornarFotoVeiculo/{id}")]
        public async Task<IActionResult> RetornarFotoVeiculo(int id)
        {
            try
            {
                var veiculo = await _dbContext.veiculos.FindAsync(id);
                if (veiculo == null || veiculo.foto == null)
                    return NotFound("Veículo ou foto não encontrada.");

                string fotoBase64 = Convert.ToBase64String(veiculo.foto);
                return Ok($"data:image/jpeg;base64,{fotoBase64}");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("CriacaoQRCode/{idVeiculo}")]
        public async Task<IActionResult> CriarQrcode(int idVeiculo)
        {
            try
            {
                var veiculo = await _dbContext.veiculos.FirstOrDefaultAsync(i => i.id == idVeiculo);
                if (veiculo == null) return NotFound("Veículo não encontrado.");

                var user = await _dbContext.usuarios.FirstOrDefaultAsync(i => i.id == veiculo.usuario_id);
                if (user == null) return NotFound("Usuário do veículo não encontrado.");

                string motivoEntrada = user.tipo_usuario_id switch
                {
                    1 => "Estudar",
                    2 => "Entregar Produtos",
                    3 => "Trabalhar",
                    4 => "Visitar",
                    _ => "Desconhecido"
                };

                string tipoVeiculo = veiculo.tipo_veiculo_id switch
                {
                    1 => "Carro",
                    2 => "Moto",
                    3 => "Van",
                    4 => "Caminhão",
                    _ => "Desconhecido"
                };

                var cnh = await _dbContext.cnh.FirstOrDefaultAsync(i => i.usuario_id == user.id);
                var dataAtual = DateTime.Now.ToString("dd-MM-yyyy HH;mm");

                var dados = new
                {
                    Data = dataAtual,
                    IdUsuario = user.id,
                    Nome = user.nome,
                    CNH = cnh?.numero_cnh,
                    Placa = veiculo.placa,
                    TipoDoVeiculo = tipoVeiculo,
                    idVeiculo = veiculo.id,
                    MotivoEntrada = motivoEntrada
                };

                var gerador = new QRCodeGenerator();
                string json = JsonSerializer.Serialize(dados);
                var qrData = gerador.CreateQrCode(json, QRCodeGenerator.ECCLevel.Q);
                var pngQr = new PngByteQRCode(qrData);
                byte[] pngBytes = pngQr.GetGraphic(20);

                string qrBase64 = Convert.ToBase64String(pngBytes);

                return Ok($"data:image/png;base64,{qrBase64}");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpGet("qtdVeiculos")] //Quantidade de veiculos
        public async Task<ActionResult<IEnumerable<veiculos>>> quantidade()
        {
            try
            {
                var contagem = await _dbContext.veiculos
                    .GroupBy(i => i.tipo_veiculo_id)
                    .Select(i => new
                    {
                        Tipo = i.Key,
                        Quantidade = i.Count()
                    }).ToListAsync();

                var resultado = new
                {
                    Carro = contagem.FirstOrDefault(i => i.Tipo == 1)?.Quantidade ?? 0,
                    Moto = contagem.FirstOrDefault(i => i.Tipo == 2)?.Quantidade ?? 0,
                    Van = contagem.FirstOrDefault(i => i.Tipo == 3)?.Quantidade ?? 0,
                    Caminhao = contagem.FirstOrDefault(i => i.Tipo == 4)?.Quantidade ?? 0
                };

                return Ok(resultado);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPut("InativarSaida/{id}")] //status de ativo para inativo
        public async Task<ActionResult<veiculos>> Inativar(int id)
        {
            try
            {
                var veiculos = await _dbContext.veiculos.FindAsync(id);
                veiculos.status_id = 2;
                await _dbContext.SaveChangesAsync();
                return Ok("Veículo foi inativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPut("AtivarSaida/{id}")] //status de ativo para inativo
        public async Task<ActionResult<veiculos>> Ativar(int id)
        {
            try
            {
                var veiculos = await _dbContext.veiculos.FindAsync(id);
                veiculos.status_id = 1;
                await _dbContext.SaveChangesAsync();
                return Ok("Veículo foi ativado com sucesso!");
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }
    }
}
