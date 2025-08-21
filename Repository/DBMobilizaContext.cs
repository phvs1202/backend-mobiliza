using Microsoft.EntityFrameworkCore.Infrastructure;
using MobilizaAPI.Model;
using Microsoft.EntityFrameworkCore;

namespace MobilizaAPI.Repository
{
    public class DBMobilizaContext : DbContext
    {
        public DBMobilizaContext(DbContextOptions<DBMobilizaContext> options) : base(options)
        {
        }

        public DbSet<curso> curso { get; set; }
        public DbSet<entrada> entrada{ get; set; }
        public DbSet<saida> saida { get; set; }
        public DbSet<tipo_usuario> tipo_usuario { get; set; }
        public DbSet<tipo_veiculo> tipo_veiculo { get; set; }
        public DbSet<usuarios> usuarios { get; set; }
        public DbSet<veiculos> veiculos { get; set; }
        public DbSet<gerenciadores> gerenciadores { get; set; }
        public DbSet<status> status { get; set; }
        public DbSet<cnh> cnh { get; set; }
    }
}
