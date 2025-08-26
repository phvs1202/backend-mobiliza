using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MobilizaAPI.Model;
using MobilizaAPI.Repository;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;
using QRCoder;
using System.Drawing.Imaging;
using System.Drawing.Text;
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

        [HttpGet("TodosVeiculos")] //Trazer todos os tipos
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

        [HttpGet("VeiculoEspecifico/{id}")] //Trazer veiculo específico
        public async Task<ActionResult<IEnumerable<veiculos>>> GetTipo(int id)
        {
            try
            {
                var veiculos = _dbContext.veiculos.Where(i => i.id == id).FirstOrDefault();
                return Ok(veiculos);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        [HttpPost("CadastroVeiculo")] //Cadastrar seu veículo
        public IActionResult Veiculos([FromBody] List<veiculos> veiculos)
        {
            try
            {
                foreach (var veiculo in veiculos)
                {
                    _dbContext.veiculos.Add(veiculo);
                    veiculo.status_id = 1;
                    _dbContext.SaveChanges();
                }
                return Ok("Veículo cadastrado");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Erro ao realizar login.", erro = ex.Message });
            }
        }

        [HttpGet("VeiculoPorUsuario/{id}")] //Trazer veiculo por usuario
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
        
        [HttpPut("InativarVeiculos/{id}")] //status de ativo para inativo
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

        [HttpPost("UploadFoto/{id}")] //upload de foto de carro
        public async Task<IActionResult> UploadFoto(int id, IFormFile arquivo)
        {
            try
            {
                var veiculos = await _dbContext.veiculos.FindAsync(id);
                if (veiculos == null)
                    return NotFound("Veiculos não encontrado.");

                if (arquivo == null || arquivo.Length == 0)
                    return BadRequest("Arquivo inválido.");

                //garante que a pasta existe
                var pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ImagensVeiculos");
                if (!Directory.Exists(pasta))
                    Directory.CreateDirectory(pasta);

                //nome único para o arquivo
                string extensao = Path.GetExtension(arquivo.FileName);
                if (string.IsNullOrEmpty(extensao) || extensao != ".jpg")
                    return BadRequest("Extensão do arquivo não permitida!");

                var nomeArquivo = $"{id}{extensao}";
                var caminhoCompleto = Path.Combine(pasta, nomeArquivo);

                //salva o arquivo
                using (var stream = new FileStream(caminhoCompleto, FileMode.Create))
                {
                    await arquivo.CopyToAsync(stream);
                }

                //atualiza o caminho da foto no usuário
                veiculos.foto = nomeArquivo;
                _dbContext.Update(veiculos);
                await _dbContext.SaveChangesAsync();

                return Ok(new { message = "Foto enviada com sucesso!", arquivo = nomeArquivo });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Erro interno: {ex.Message}");
            }
        }

        [HttpGet("RetornarFotoVeiculo/{id}")]
        public IActionResult RetornarFotoVeiculo(int id)
        {
            var veiculo = _dbContext.veiculos.Find(id);
            if (veiculo == null || string.IsNullOrEmpty(veiculo.foto))
                return NotFound("Veículo ou foto não encontrada.");

            var pasta = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "ImagensVeiculos");
            var caminhoImagem = Path.Combine(pasta, veiculo.foto);

            if (!System.IO.File.Exists(caminhoImagem))
                return NotFound("Arquivo de imagem não encontrado.");

            var imagemBytes = System.IO.File.ReadAllBytes(caminhoImagem);
            return File(imagemBytes, "image/jpeg");
        }

        [HttpPost("CriacaoQRCode/{idVeiculo}")] //Criar qrcode
        public async Task<ActionResult<IEnumerable<cnh>>> CriarQrcode(int idVeiculo)
        {
            try
            {
                var veiculo = _dbContext.veiculos.Where(i => i.id == idVeiculo).FirstOrDefault();
                var user = _dbContext.usuarios.Where(i => i.id == veiculo.usuario_id).FirstOrDefault();

                string motivoEntrada = user.tipo_usuario_id switch
                {
                    1 => "Estudar",                   // Aluno
                    2 => "Entregar Produtos",         // Fornecedor
                    3 => "Trabalhar",                 // Funcionário
                    4 => "Visitar",                   // Visitante
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

                var cnh = _dbContext.cnh.Where(i => i.usuario_id == user.id).FirstOrDefault();
                var dataAtual = DateTime.Now.ToString("dd-MM-yyyy HH;mm");

                var dados = new
                {
                    Data = dataAtual,
                    IdUsuario = user.id,
                    Nome = user.nome,
                    CNH = cnh.numero_cnh,
                    Placa = veiculo.placa,
                    TipoDoVeiculo = tipoVeiculo,
                    idVeiculo = veiculo.id,
                    MotivoEntrada = motivoEntrada,
                    CaminhoImagem = $"ImagensVeiculos/{veiculo.id}.jpg"
                };

                //var conteudoCodigo = $"Data-{dataAtual}, Nome-{user.nome}, CNH-{cnh.numero_cnh}, Placa-{veiculo.placa}, Tipo do Veiculo-{tipoVeiculo}";
                QRCodeGenerator GeradorQR = new QRCodeGenerator();
                string dadosJson = JsonSerializer.Serialize(dados);
                var qrData = GeradorQR.CreateQrCode(dadosJson, QRCodeGenerator.ECCLevel.Q);
                using var qrCode = new QRCode(qrData);
                using var qrImage = qrCode.GetGraphic(20);

                // Garantir que o diretório existe
                string pastaRaiz = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "QRCodeImagens");
                if (!Directory.Exists(pastaRaiz))
                {
                    Directory.CreateDirectory(pastaRaiz); // Cria a pasta se não existir
                }

                // Gerar nome único para o arquivo, baseado no conteúdo do QR Code
                string nomeArquivo = $"Data-{dados.Data} ; Placa-{dados.Placa}.jpg";
                string caminhoCompleto = Path.Combine(pastaRaiz, nomeArquivo);

                // Salvar a imagem do QR Code
                qrImage.Save(caminhoCompleto, ImageFormat.Jpeg);
                string urlImagem = $"{Request.Scheme}://{Request.Host}/QRCodeImagens/{Uri.EscapeDataString(nomeArquivo)}";
                return Ok(urlImagem);
            }
            catch (Exception ex)
            {
                return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
            }
        }

        private string GetImagemBase64(int id)
        {
            var pastaImagens = Path.Combine(Directory.GetCurrentDirectory(), "ImagensVeiculos");
            var caminhoImagem = Path.Combine(pastaImagens, $"{id}.jpg");
            var url = caminhoImagem.Replace("\\", "/");

            Console.WriteLine("caminho da imagem: ", caminhoImagem);

            return url;
        }

        //[HttpPut("AlterarVeiculo/{id}")] //Alterar veiculo por id
        //public async Task<ActionResult<veiculos>> Atualizar(int id, [FromBody] veiculos veiculos)
        //{
        //    try
        //    {
        //        var veiculoAtual = await _dbContext.veiculos.FindAsync(id);

        //        if (veiculoAtual == null)
        //            return NotFound();

        //        veiculoAtual.placa = veiculos.placa;
        //        veiculoAtual.tipo_veiculo_id = veiculos.tipo_veiculo_id;
        //        veiculoAtual.usuario_id = veiculos.usuario_id;

        //        _dbContext.Update(veiculoAtual);
        //        await _dbContext.SaveChangesAsync();
        //        return Ok(veiculoAtual);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpDelete("DeletarVeiculo/{id}")] // Deletar veiculo específico
        //public async Task<ActionResult> Deletar(int id)
        //{
        //    try
        //    {
        //        var veiculos = await _dbContext.veiculos.FindAsync(id);

        //        if (veiculos == null)
        //            return NotFound();

        //        _dbContext.veiculos.Remove(veiculos);
        //        await _dbContext.SaveChangesAsync();

        //        return Ok("Veiculo removido com sucesso!");
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}


        //[HttpGet("VeiculosAtivos")] //Trazer veiculos ativos
        //public async Task<ActionResult<IEnumerable<veiculos>>> GetAtivos()
        //{
        //    try
        //    {
        //        var veiculos = await _dbContext.veiculos.Where(i => i.status_id == 1).ToListAsync();
        //        return Ok(veiculos);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}

        //[HttpGet("VeiculosInativos")] //Trazer veiculos inativos
        //public async Task<ActionResult<IEnumerable<veiculos>>> GetInativos()
        //{
        //    try
        //    {
        //        var veiculos = await _dbContext.veiculos.Where(i => i.status_id == 2).ToListAsync();
        //        return Ok(veiculos);
        //    }
        //    catch (Exception ex)
        //    {
        //        return BadRequest($"{ex.Message} - Detalhes: {ex.InnerException?.Message}");
        //    }
        //}
    }
}
